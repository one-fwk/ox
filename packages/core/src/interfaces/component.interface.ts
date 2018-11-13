export interface IComponent {
  render(): Node | Node[];
  componentWillUnmount?(): Promise<void> | void;
  componentWillMount?(): Promise<void> | void;
  componentWillUpdate?(): Promise<boolean> | boolean;
}