export interface ICommand {
  execute(): void | boolean;
  undo(): void;
}
