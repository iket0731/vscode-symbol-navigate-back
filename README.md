# Symbol Navigate Back

### Jump back directly from "Go to Definition"

This extension provides alternative commands for symbol navigation commands such as `Go to Definition` (default keymap: `F12`).

The alternative commands save the current cursor position (add it to the internal stack) and then call the original command to jump. You can return directly to the original position regardless of cursor movement or editing at the jump destination.

### About `Go Back`
You can also the use built-in `Go Back` (default keymap: `Alt+LeftArrow`) to return to the original position. However, depending on cursor move operations at the jump destination (Searching, scrolling by `PageUp` / `PageDown`, etc), the cursor position will be added to the history, so you may need to `Go Back` many times.

## Features
This extension contributes the following commands. To use these commands, you need to remap default keys or assign new keymaps.

- `Symbol Navigate Back: Go to Definition` - Save the current position, then call built-in `Go to Definition`
- `Symbol Navigate Back: Go to Declaration`  - Save the current position, then call built-in `Go to Declaration`
- `Symbol Navigate Back: Go to Type Definition`  - Save the current position, then call built-in `Go to Type Definition`
- `Symbol Navigate Back: Go to Implementations`  - Save the current position, then  call built-in `Go to Implementations`
- `Symbol Navigate Back: Go to References`  - Save the current position, then call built-in `Go to References`
- `Symbol Navigate Back: Execute Command`  - Save the current position, then execute the command specified by an argument
- `Symbol Navigate Back: Save Current Position`  - Save the current position only
- `Symbol Navigate Back: Go Back`  - Jump back to the previously saved position
- `Symbol Navigate Back: Go Forward`  - Jump forward to the next position in this extension's stack

Go to definition, PageDown several times, and then go back:
![`Go to Definition` and `Go Back`](symbol-navigate-back.gif)
