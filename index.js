let editor = CodeMirror(document.getElementById("bf-editor"), {
	lineNumbers: true,
	lineWrapping: true,
	tabSize: 2,
	mode: "text/x-brainfuck",
	theme: "darcula",
	value:
		"++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.",
});
editor.focus();

let cells;
let pointer;
let loops;
let compiled;
let loopCall;
let lines;
let executeFromIndex;
let error;

const run_btn = document.getElementById("run-btn");
const cellstxt = document.getElementById("cells");
const output = document.getElementById("output");
const input = document.getElementById("input");

input.addEventListener("input", (ev) => {
	cells[pointer] = ev.target.value.charCodeAt(0);
	input.value = "";
	input.classList.remove("focus");
	output.innerHTML = compile();
});
input.addEventListener("paste", (ev) => {
	ev.preventDefault();
});

run_btn.addEventListener("click", () => {
	cells = [0];
	pointer = 0;
	loops = [];
	compiled = "";
	loopCall = 0;
	lines = editor.getValue().replace(/[ \t]/g, "").split("\n");
	executeFromIndex = 0;
	error = false;
	output.classList.remove("error");
	cellstxt.innerHTML = "";
	output.innerHTML = compile();
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

function compile() {
	if (error) return "";
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
	for (let i = executeFromIndex; i < join.length; i++) {
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
			case ",":
				input.classList.add("focus");
				input.focus();
				executeFromIndex = i + 1;
				cellstxt.innerHTML = "[" + cells + "]";
				return compiled;
		}
	}
	cellstxt.innerHTML = "[" + cells + "]";
	return compiled;
}

function err() {
	error = true;
	output.classList.add("error");
}
