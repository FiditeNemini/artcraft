export const getFileName = (file: File) => {
  return file.name.split(".")[0] || "";
};
