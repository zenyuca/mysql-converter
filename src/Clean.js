let fse = require('fs-extra')

class Clean {
  constructor () {
    this.dirList = [
      './build/',
      './build/mapper/',
      './build/pojo/',
      './build/service/',
      './build/service/impl/',
      './build/controller/',
      './page/'
    ]
    this.clearAll()
    this.createAll()
  }

  clearAll () {
    this.dirList.forEach((e, i) => {
      fse.remove(e, err => {
        if (err) return console.error(err)
        console.log('success!')
      })
    })
  }

  createAll () {
    this.dirList.forEach((e, i) => {
      fse.ensureDir(e, err => {
        console.log(err)
      })
    })
  }
}

module.exports = {
  clean: new Clean()
}
