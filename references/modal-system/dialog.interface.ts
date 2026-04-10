export interface Dialog {
  icon?: {
    name?:
    string |
    'info' |
    'code' |
    'trash' |
    'check' |
    'error' |
    'clock' |
    'more' |
    'message';
    container: string;
  };
  title?: string;
  titleBold?: string;
  text?: string;
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
