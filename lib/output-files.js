// output JavaScript bundled in puppeteer output to format
// that can be eaten by Istanbul.

// TODO: Put function interfaces on this file

const fs = require('fs')
const mkdirp = require('mkdirp')
const clone = require('clone')
const pathLib = require('path')

const storagePath = './.nyc_output/js'

class OutputFiles {
  constructor (coverageInfo) {
    // Clone coverageInfo to prevent mutating the passed in data
    this.coverageInfo = clone(coverageInfo)
    this.iterator = 0
    this._parseAndIsolate()
  }

  rewritePath (path) {
    // generate a new path relative to ./coverage/js.
    // this would be around where you'd use mkdirp.

    var str = ``

    // Get the last element in the path name
    var truncatedPath = pathLib.basename(path)
    var pathWithoutWebpack = path.split('webpack-internal:///')[1]

    if(pathWithoutWebpack) {
      // Special case: when the file was processed by web pack
      truncatedPath = pathWithoutWebpack
    } else if (truncatedPath.includes('.html')) {
      // Special case: when html present, strip and return specialized string
      truncatedPath = pathLib.resolve(storagePath, truncatedPath) + 'puppeteerTemp-inline'
    } else {
      truncatedPath = truncatedPath.split('.js')[0]
      truncatedPath = pathLib.resolve(storagePath, truncatedPath)
    }
    mkdirp.sync(storagePath)
    if (fs.existsSync(truncatedPath + '.js')) {
      this.iterator++
      str = `${truncatedPath}-${this.iterator}.js`
      return str
    } else {
      str = `${truncatedPath}.js`
      return str
    }
  }

  _parseAndIsolate () {
    for (var i = 0; i < this.coverageInfo.length; i++) {
      var path = this.rewritePath(this.coverageInfo[i].url)
      this.coverageInfo[i].url = path
      fs.writeFileSync(path, this.coverageInfo[i].text)
    }
  }

  getTransformedCoverage () {
    return this.coverageInfo
  }
}

module.exports = function (coverageInfo) {
  return new OutputFiles(coverageInfo)
}
