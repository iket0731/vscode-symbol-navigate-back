# Symbol Navigate Back

This extension contributes alternative commands for symbol navigation commands such as `Go to Definition` (default key binding: `F12`).

The alternative commands save the current cursor position (add it to the stack) and then call the original command to jump. You can return directly to the original position regardless of cursor movement or editing at the jump destination.

You can also the use built-in `Go Back` (default key binding: `Alt+LeftArrow`) to return to the original position. However, depending on cursor move operations at the jump destination (Searching, scrolling by `PageUp` / `PageDown`, etc), the cursor position will be added to the history, so you may need to `Go Back` many times.

## Screencast
Go to definition, PageDown several times, and then go back:
![`Go to Definition` and `Go Back`](symbol-navigate-back.gif)

## Features
This extension contributes the following commands. Please assign keyboard shortcuts to these commands and use them.

|Command|Description|
|---|---|
|`Symbol Navigate Back: Go to Definition`|Save the current cursor position and call built-in `Go to Definition`|
|`Symbol Navigate Back: Open Definition to the Side` |Save the current cursor position and call built-in `Open Definition to the Side`
|`Symbol Navigate Back: Go to Declaration` |Save the current cursor position and call built-in `Go to Declaration`
|`Symbol Navigate Back: Go to Type Definition` |Save the current cursor position and call built-in `Go to Type Definition`
|`Symbol Navigate Back: Go to Implementations` |Save the current cursor position and call built-in `Go to Implementations`
|`Symbol Navigate Back: Go to References` |Save the current cursor position and call built-in `Go to References`
|`Symbol Navigate Back: Go to Symbol in Workspace...` |Save the current cursor position and call built-in `Go to Symbol in Workspace...`
|`Symbol Navigate Back: Go Back` |Jump back to the previously saved cursor position|
|`Symbol Navigate Back: Go Forward` |Jump forward to the next cursor position in this extension's stack|
