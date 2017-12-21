/**
 * @flow
 */
'use strict';

const RNFS = require('react-native-fs');
const { Base64 } = require('js-base64');

const ChunkedFileData = require('./ChunkedFileData');
const MediaFileReader = require('./MediaFileReader');

import type {
  LoadCallbackType
} from './FlowTypes';


class ReactNativeFileReader extends MediaFileReader {
  _path: string;
  _fileData: ChunkedFileData;

  constructor(path: string) {
    super();
    this._path = path;
    this._fileData = new ChunkedFileData();
  }

  static canReadFile(file: any): boolean {
    return (
      typeof file === 'string' &&
      !/^[a-z]+:\/\//i.test(file)
    );
  }

  getByteAt(offset: number): number {
    return this._fileData.getByteAt(offset);
  }

  _init(callbacks: LoadCallbackType) {
    var self = this;

    RNFS.stat(self._path)
      .then(statResult => {
        self._size = statResult.size;
        callbacks.onSuccess();
      })
      .catch(error => {
        callbacks.onError({"type": "fs", "info": error})
      })
  }

  loadRange(range: [number, number], callbacks: LoadCallbackType) {
    var fd = -1;
    var self = this;
    var fileData = this._fileData;

    var length = range[1] - range[0] + 1;
    var onSuccess = callbacks.onSuccess;
    var onError = callbacks.onError || function(object){};

    RNFS.read(this._path, length, range[0], 'base64')
      .then(data => {
        fileData.addData(range[0], Base64.decode(data));
        onSuccess();
      })
      .catch(err => {
        onError({"type": "fs", "info": err});
      });
  }
}

module.exports = ReactNativeFileReader;
