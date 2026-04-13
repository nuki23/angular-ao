export interface Dialog {
  icon?: {
    name?: any;
    container: string;
  };
  text?: string;
  textBold?: string;
  subText?: string;
  gridButton?: number,
  confirmButton?: {
    text: string
    icon?: string
  };
  exitButton?: {
    text: string
    icon?: string
  };
  cancelButton?: {
    text: string
    icon?: string
  };
  callback?: any;

  data?: any
  padding?: string;
  withClass?: 'nzXXs' | 'nzXs' | 'nzSm' | 'nzMd' | 'nzLg' | 'nzXlg' | 'nzXxl' | 'nz2Xs' | 'nz300';

}
