'use strict';

const rmEndSlashes = /^(.*?)\/{1,}$/g;

function combine(absolutePath, ...relativePath) {
  let firstRelPath = relativePath.length ? relativePath[0] : '';

  if (!firstRelPath) {
    return absolutePath;
  } else if (firstRelPath.startsWith("http") || firstRelPath.startsWith("https") || firstRelPath.startsWith("/")) {
    return firstRelPath;
  } else {
    let tmp = '';
    relativePath.forEach(path => {
      tmp += '/' + path;
    })

    return absolutePath.replace(rmEndSlashes, "$1") + tmp.replace(/(\\|\/){2,}/g, '/');
  }
}

let imageAbsolutePath = '';
if (hexo.config.tag_replace && hexo.config.tag_replace.image) {
  imageAbsolutePath = hexo.config.tag_replace.image.absolute_path;
}

let enable = false;

if (hexo.config.tag_replace && hexo.config.tag_replace.enable) {
  enable = hexo.config.tag_replace.enable;
}

if (enable === true) {
  const mdImageOrLinkPattern = /\[(.*?)\]\((.*?)\)/g;
  const postNamePattern = /.*?\/(.*?)\.md$/g;

  hexo.extend.filter.register('before_post_render', function (data) {
    if (data.source.endsWith(".md")) {
      let postName = data.source.replace(postNamePattern, "$1");

      // Process the image/link tag.
      data.content = data.content.replace(mdImageOrLinkPattern, (s) => {
        let name = s.replace(mdImageOrLinkPattern, "$1");
        let path = s.replace(mdImageOrLinkPattern, "$2");

        // Don't touch the absolute path.
        if (path.startsWith('http')) {
          return s;
        } else {
          return '![' + name + '](' + combine(imageAbsolutePath, postName, path) + ')';
        }
      });
    }

    return data;
  });
}