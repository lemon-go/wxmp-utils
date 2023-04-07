// --------------------------------------------
// 人脸图像处理。
// @author: YuanYou
// --------------------------------------------

/** 读取本地图片的base64编码。 */
export function readImageAsBase64(src: string): Promise<IImageBase64> {
  return wx.getImageInfo({ src }).then(img => {
    const imgType = img.type === 'unknown' ? 'jpeg' : img.type;
    return new Promise<IImageBase64>((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: img.path,
        encoding: 'base64',
        success({ data }) {
          const base64 = data as string;
          const fullBase64 = `data:image/${imgType};base64,${base64}`;
          resolve({ fullBase64, base64 });
        },
        fail: reject
      });
    });
  });
}

/** 将base64图片转存为图片，并返回图片地址。 */
export function readBase64AsImage(base64: string): Promise<string> {
  const path = wx.env.USER_DATA_PATH + '/bdface_latest.png';
  const fs = wx.getFileSystemManager();
  return new Promise<string>((resolve, reject) => {
    fs.access({
      path,
      success() { resolve(path) },
      fail() {
        fs.writeFile({
          filePath: path,
          data: base64,
          encoding: 'base64',
          success() {
            resolve(path);
          },
          fail: reject
        });
        // end write
      }
    });
    // end access
  });
}

interface IImageBase64 {
  /** base64编码。 */
  base64: string;
  /** 可用于图片解析和展示的base64编码。 */
  fullBase64: string;
}

// export function getImageLt2M(filePath: string) {
//   return new Promise<number>((resolve, reject) => {
//     const fs = wx.getFileSystemManager();
//     fs.getFileInfo({
//       filePath,
//       // 文件大小，以字节为单位
//       success({ size }) {
//         // console.log(size + ' #文件大小(M)# ' + (size / 1024 / 1024))
//         wx.showModal({
//           content: size + ' #文件大小(M)# ' + (size / 1024 / 1024)
//         });
//         resolve(size);
//       },
//       fail: reject
//     });
//   });
// }