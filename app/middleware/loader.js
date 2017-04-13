'use strict'

/**
 * 资源加载器
 * 
 * @param {String} 生产环境中的加载uri
 */
module.exports = (uri) => {
  let assets = {
    js: [],
    css: []
  };

  return {
    /**
     * 加载js
     * 
     * @param {String} 开发环境中的加载uri
     * @returns this
     */
    js: function(uri) {
      assets.js.push(uri);
      return this;
    },
    /**
     * 加载css
     * 
     * @param {String} 开发环境中的加载uri
     * @returns this
     */
    css: function(uri) {
      assets.css.push(uri);
      return this;
    },

    /**
     * 
     * @param {Object} {
     *       prefix: "", uri前缀
     *       env: "", 环境选项,"production"为生产环境
     *       CDNMap: {} 静态资源,生产环境时用到
     *     }
     * @returns html
     */
    done: function({
      prefix: prefix,
      env: env,
      CDNMap: CDNMap
    } = {
      prefix: "",
      env: "",
      CDNMap: {}
    }) {
      return env === "production" ? pro(uri, prefix, CDNMap) : dev(assets, prefix, CDNMap);
    }
  };
};

function pro(uri, prefix, CDNMap) {

}

function dev(assets, prefix, CDNMap) {
  let html = "",
    version = Date.now();
  assets.css.forEach((css) => {
    html += `<link rel="stylesheet" href="${
      CDNMap[prefix+css] || (prefix+css)
    }?v=${version}" media="all" />`;
  });
  assets.js.forEach((js) => {
    html += `<script src="${
      CDNMap[prefix+js] || (prefix+js)
    }?v=${version}"></script>\n`;
  });

  return html;
}
