let editor = CodeMirror(document.getElementById("bf-editor"), {
	lineNumbers: true,
	lineWrapping: true,
	tabSize: 2,
	mode: "text/x-brainfuck",
	theme: "darcula",
	value:
		"++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.",
});

const output = document.getElementById("output");

document.getElementById("run-btn").addEventListener("click", () => {
	output.innerHTML = compile(editor.getValue());
});

function pairIndex(source, startIndex) {
	if (source[startIndex] == "[") {
		let open = 1;
		while (open > 0) {
			startIndex++;
			if (source[startIndex] === "[") {
				open++;
			} else if (source[startIndex] === "]") {
				open--;
			}
		}
	}
	// // unused
	// else {
	// 	let close = 1;
	// 	while (close > 0) {
	// 		startIndex--;
	// 		if (source[startIndex] === "]") {
	// 			close++;
	// 		} else if (source[startIndex] === "[") {
	// 			close--;
	// 		}
	// 	}
	// }
	return startIndex;
}

function countChar(str, char) {
	let count = 0;
	for (let chr of str) {
		if (chr == char) count++;
	}
	return count;
}

function compile(source) {
	let cells = [0];
	let pointer = 0;
	let loops = [];
	let compiled = "";
	let loopCall = 0;
	let lines = source.replace(/[ \t]/g, "").split("\n");
	output.classList.remove("error");
	for (let line in lines) {
		let tmp = "";
		for (let char in lines[line]) {
			if (
				["+", "-", ">", "<", "[", "]", ".", ","].includes(lines[line][char])
			) {
				tmp += lines[line][char];
			} else break;
		}
		lines[line] = tmp;
	}
	let join = lines.join("");
	let op = countChar(join, "[");
	let cl = countChar(join, "]");
	if (op != cl) {
		err();
		return "Syntax Error: Too many `" + (op > cl ? "[" : "]") + "`s";
	}
	for (let i = 0; i < join.length; i++) {
		switch (join[i]) {
			case "+":
				cells[pointer]++;
				break;
			case "-":
				if (--cells[pointer] < 0) cells[pointer] = 0;
				break;
			case ">":
				if (++pointer >= cells.length) cells.push(0);
				break;
			case "<":
				if (--pointer < 0) pointer = 0;
				break;
			case ".":
				compiled += String.fromCharCode(cells[pointer]);
				break;
			case "[":
				let p = pairIndex(join, i);
				loops.push(i);
				if (cells[pointer] === 0) i = p;
				break;
			case "]":
				if (cells[pointer] !== 0) {
					i = loops[loops.length - 1];
					if (++loopCall == 10000) {
						err();
						return (
							"Error : Maximum loop call (10k) exceeded<br><tab>`[` number : " +
							(i + 1) +
							"<br><tab>Cell index : " +
							pointer
						);
					}
				} else {
					loops.pop();
					loopCall = 0;
				}
				break;
		}
	}
	return compiled;
}

function err() {
	output.classList.add("error");
}
