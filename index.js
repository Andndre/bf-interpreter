var editor = CodeMirror(document.getElementById("bf-editor"), {
	lineNumbers: true,
	lineWrapping: true,
	tabSize: 2,
	mode: "text/x-brainfuck",
	theme: "darcula",
	value:
		"++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.",
});

document.getElementById("run-btn").addEventListener("click", () => {
	const console = document.getElementById("output");
	console.innerHTML = compile(editor.getValue());
});

function compile(source) {
	// remove all characters except (+), (-), (>), (<), ([), (.), (,), and (])
	source = source.replace(/[^+\-<>\[\]\.,\(\)]/g, "");
	let tokens = source.split("");
	return compileTokens(tokens);
}
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
	} else {
		let close = 1;
		while (close > 0) {
			startIndex--;
			if (source[startIndex] === "]") {
				close++;
			} else if (source[startIndex] === "[") {
				close--;
			}
		}
	}
	return startIndex;
}
function compileTokens(source) {
	let cells = [0];
	let pointer = 0;
	let depth = [];
	let compiled = "";
	for (let i = 0; i < source.length; i++) {
		switch (source[i]) {
			case "+":
				cells[pointer]++;
				break;
			case "-":
				cells[pointer]--;
				if (cells[pointer] < 0) cells[pointer] = 0;
				break;
			case ">":
				pointer++;
				if (pointer >= cells.length) cells.push(0);
				break;
			case "<":
				pointer--;
				if (pointer < 0) pointer = 0;
				break;
			case ".":
				compiled += String.fromCharCode(cells[pointer]);
				break;
			case "[":
				depth.push(i);
				if (cells[pointer] === 0) i = pairIndex(source, i);
				break;
			case "]":
				if (cells[pointer] !== 0) i = depth[depth.length - 1];
				else depth.pop();
				break;
		}
	}
	return compiled;
}
