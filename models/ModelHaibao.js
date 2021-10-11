'use strict';

import mongoose from '../mongodb/db'

const Schema = mongoose.Schema;
// 图鉴表，根据等级
const ModelHaibao = new Schema({
  openid: {
    type: String,
    default: ''
  },
  nickname: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
})

export default mongoose.model('ModelHaibao', ModelHaibao);