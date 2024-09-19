import { ICommand } from "./ICommand";

export class UndoStackManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private readonly STACK_LIMIT = 20;

  executeCommand(command: ICommand) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear the redo stack

    // Ensure the undo stack does not exceed the limit
    if (this.undoStack.length > this.STACK_LIMIT) {
      this.undoStack.shift(); // Remove the oldest command
    }
  }

  undo() {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);

      // Ensure the redo stack does not exceed the limit
      if (this.redoStack.length > this.STACK_LIMIT) {
        this.redoStack.shift(); // Remove the oldest command
      }
      console.log("undo:");
      console.log(this.undoStack);
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);

      // Ensure the undo stack does not exceed the limit
      if (this.undoStack.length > this.STACK_LIMIT) {
        this.undoStack.shift(); // Remove the oldest command
      }

      console.log("Redo:");
      console.log(this.redoStack);
    }
  }
}
