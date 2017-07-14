class StringUtil {
  headToUpperCase (name) {
    return name.replace(/^\w/, (value) => {
      return value.toUpperCase()
    })
  }

  headToLowerCase (name) {
    return name.replace(/^\w/, (value) => {
      return value.toLowerCase()
    })
  }

  toCamelCase (name) {
    let newName = name.replace(/_\w/g, (value) => {
      return value.slice(-1).toUpperCase()
    })
    return newName
  }
}

module.exports = {
  string: new StringUtil()
}
