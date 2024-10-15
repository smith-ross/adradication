export const classNames = (classNames: (string | boolean)[]) => {
    let classNameString = ""
    classNames.forEach((value) => {
        if (typeof value === "boolean") return;
        classNameString += " " + value;
    })
    return classNameString
}