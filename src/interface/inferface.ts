export interface fileEmpty {
  fileName: string;
  fileUrl: string;
}

export interface uploadResponse {
  message: string;
  arrayTotalOpenai: any[];
  vacias: any[];
  fileEmpty: fileEmpty[];
}
