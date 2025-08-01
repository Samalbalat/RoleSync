export function checkIfImage(file) {
    return !file.type.startsWith("image/");
}