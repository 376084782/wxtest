'use strict';

import mongoose from '../mongodb/db'

const Schema = mongoose.Schema;
// 图鉴表，根据等级
const ModelUser1 = new Schema({
  phone: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  number: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
})

export default mongoose.model('ModelUser1', ModelUser1);