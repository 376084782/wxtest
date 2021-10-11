'use strict'

const Service = require('egg').Service
// 引入exceljs
const Excel = require('exceljs')

class exportFileService {
  constructor(prop) {
    this.defaultViews = [{
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible',
    }, ]
    this.fontName = 'Arial Unicode MS'
    this.font = {
      name: this.fontName,
      family: 4,
      size: 13
    }
    this.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FF8DB4E2'
      }
    }
    this.border = {
      style: 'thin',
      color: {
        argb: 'cccccc'
      }
    }
  }
  /**
   * 导出excel
   * @param { Object } config 传入的excel对象
   * @param { Array } config.data excel的数据
   * @param { String } config.filename excel文件名
   * @param { Array } config.header excel的头部
   * @param { String } config.sheetName 表名
   * @param { Array } config.imageKeys 需要转化图片的key
   * @param { String } config.creator 创建表的人
   * @param { String } config.lastModifiedBy 最后修改表的人
   * @param { String } config.imageKeys.imgWidth 图片的宽度
   * @param { String } config.imageKeys.imgHeight 图片的高度
   * */
  async exportExcel({
    data = [],
    filename = 'file',
    header,
    sheetName = 'sheet1',
    imageKeys = [],
    creator = 'me',
    lastModifiedBy = 'her',
  }) {
    const {
      ctx
    } = this
    const workbook = new Excel.Workbook()
    // 设置属性 -创建着以及最后修改的人
    workbook.creator = creator
    workbook.lastModifiedBy = lastModifiedBy

    // 时间获取一次就好
    const now = new Date()
    workbook.created = now
    workbook.modified = now
    workbook.lastPrinted = now
    const worksheet = workbook.addWorksheet(sheetName)
    // 设置打开时候的视图-设置位置
    workbook.views = this.defaultViews
    // 使工作表可见
    worksheet.state = 'visible'
    worksheet.columns = header

    for (let i = 1; i <= header.length; i++) {
      worksheet.getColumn(i).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }
      worksheet.getColumn(i).font = {
        name: 'Arial Unicode MS'
      }
    }
    worksheet.addRows(data)
    // 多级表头
    const headerOPtion = header.filter((item, index) => {
      if (item.type && item.type === 'multi') {
        header.splice(index, 1)
        return item
      }
      return item.type && item.type === 'multi'
    })
    // 多级表头重置设置表头
    if (headerOPtion.length) {
      headerOPtion[0].headerText.forEach((text, index) => {
        const borderAttr = {
          top: this.border,
          left: this.border,
          bottom: this.border,
          right: this.border,
          index
        }
        const headerAttr = [{
            attr: 'values',
            value: text,
          },
          {
            attr: 'font',
            value: this.font,
          },
          {
            attr: 'fill',
            value: this.fill,
          },
          {
            attr: 'border',
            value: borderAttr,
          },
        ]
        headerAttr.map(item => {
          worksheet.getRow(index + 1)[item.attr] = item.value
          return worksheet
        })
      })
      headerOPtion[0].mergeOption.forEach(merge => {
        worksheet.mergeCells(merge)
      })
    } else {
      // 设置表头样式
      worksheet.getRow(1).font = this.font
      worksheet.getRow(1).fill = this.fill
    }
    const bufferContent = await workbook.xlsx.writeBuffer()

    // 设置
    ctx.set('Content-disposition', `attachment;filename=${filename}.xlsx`)
    // 返回文件buffer
    ctx.body = bufferContent
  }
}

module.exports = exportFileService