/**
 * Created by C0dEr on 16/9/14.
 */
;(function ($) {
  var _DEFAULT = {
    pageIndex: 1, // 默认页
    pageSize: 10, // 默认分页大小
    pageIndexName: 'page', // 分页参数名称
    pageSizeName: 'pageSize', // 分页大小参数名称
    onChange: $.noop, // 分页改变或分页大小改变时的回调
    allowActiveClick: true, // 控制当前页是否允许重复点击刷新
    middlePageItems: 4, // 中间连续部分显示的分页项
    frontPageItems: 2, // 分页起始部分最多显示2个分页项，否则就会出现省略分页项
    backPageItems: 2, // 分页结束部分最多显示2个分页项，否则就会出现省略分页项
    ellipseText: '...', // 中间省略部分的文本
    prevText: '上一页',
    nextText: '下一页',
    prevDisplay: true, // 是否显示上一页按钮
    nextDisplay: true, // 是否显示下一页按钮
    firstText: '首页',
    lastText: '尾页',
    firstDisplay: true, // 是否显示首页按钮
    lastDisplay: true, // 是否显示尾页按钮
    totalCount: 0, // 总条数
    isAlwaysShow: false, // 当没有数据时是否显示分页
    isAjax: true, // 是否是ajax分页
    needAjaxHandleData: true,//是否需要ajax控制数据渲染
    containerTag: 'ul', // 分页容器
    itemTag: 'li a', // 分页项
    containerClass: 'pagination', // 容器样式
    containerStyle: 'margin-top: 0px', // 容器style
    itemActiveClass: 'active', // 选中状态样式
    itemClass: '', // 一般样式
    searchOption: {}, // 搜索条件
    url: '', // 分页url
    hasCache: false, // 是否需要缓存
    ajaxCallback: $.noop, // ajax回调
    ajaxErrorCallback: $.noop, // ajax错误回调
    ajaxMethod: 'POST', // ajax提交方法
    responseItemCountName: 'total', // 返回数据总条数名称
    tableContainer: 'table tbody', // 数据表格标签
  }
  var options = {}
  var data = {}
  var pageItemClass = {
    'firstPage': 'firstpage',
    'prevPage': 'prevpage',
    'itemNum': 'itemnum',
    'nextPage': 'nextpage',
    'lastPage': 'lastpage'
  }
  var thisElement
  var _init = false

  /**
   * 获取连续部分的起止索引
   */
  function getInterval () {
    var ne_half = Math.ceil(options.middlePageItems / 2)
    var np = data.pages
    var upper_limit = np - options.middlePageItems
    var start = options.pageIndex > ne_half ? Math.max(Math.min(options.pageIndex - ne_half, upper_limit), 0) : 0
    var end = options.pageIndex > ne_half ? Math.min(options.pageIndex + ne_half, np) : Math.min(options.middlePageItems, np)
    return [start, end]
  }

  function render (element) {
    function itemPackage (tags, isActive, html, itemActiveClass, itemClass, index, des) {
      if (tags.length == 0) {
        return html
      }
      var tempHtml = []
      var t = tags.pop()
      tempHtml.push(['<',
        t,
        " class='",
        tags.length == 0 ? itemClass + ' pageitem ' + des : '',
        tags.length == 0 && ((options.pageIndex == data.pages && (index == options.lastText || index == options.nextText))
        || (options.pageIndex == 1 && (index == options.firstText || index == options.prevText))) ? ' disabled ' : '',
        ' ',
        isActive && tags.length == 0 ? itemActiveClass + "'" : " '",
        t.toLowerCase() == 'a' ? "href='javascript:;' " : '',
        " style='",
        tags.length == 0 && ((options.pageIndex == data.pages && (index == options.lastText || index == options.nextText))
        || (options.pageIndex == 1 && (index == options.firstText || index == options.prevText))) ? 'cursor:not-allowed' : '',
        "'>",
        html == null || html == '' ? index : html,
        '</', t,
        '>'].join(''))
      return itemPackage(tags, isActive, tempHtml.join(''), itemActiveClass, itemClass, index, des)
    }

    function containerPackage () {
      var html = []
      html.push([
        '<',
        options.containerTag,
        " class='",
        options.containerClass,
        "' style='",
        options.containerStyle,
        "'></",
        options.containerTag,
        '>'
      ].join(''))
      return html.join('')
    }

    function getItem () {
      var interval = getInterval()
      var items = []
      // 产生起始点
      if (interval[0] > 0 && options.frontPageItems > 0) {
        var end = Math.min(options.frontPageItems, interval[0])
        for (var i = 0; i < end; i++) {
          items.push(i + 1)
        }
        if (options.frontPageItems < interval[0] && options.ellipseText) {
          items.push(options.ellipseText)
        }
      }

      // 产生内部的些链接
      for (var i = interval[0]; i < interval[1]; i++) {
        items.push(i + 1)
      }

      // 产生结束点
      if (interval[1] < data.pages && options.backPageItems > 0) {
        if (data.pages - options.backPageItems > interval[1] && options.ellipseText) {
          items.push(options.ellipseText)
        }
        var begin = Math.max(data.pages - options.backPageItems, interval[1])
        for (var i = begin; i < data.pages; i++) {
          items.push(i + 1)
        }
      }

      return items
    }

    if (options.isAlwaysShow || options.totalCount != 0) {
      var container = element.append(containerPackage()).find(options.containerTag)
      options.firstDisplay &&
      container.append(itemPackage(options.itemTag.split(' '), false, '', '', options.itemClass, options.firstText, pageItemClass.firstPage))
      options.prevDisplay &&
      container.append(itemPackage(options.itemTag.split(' '), false, '', '', options.itemClass, options.prevText, pageItemClass.prevPage))
      var pageItem = getItem()
      for (var it in pageItem) {
        container.append(itemPackage(options.itemTag.split(' '), pageItem[it] == options.pageIndex, '', options.itemActiveClass, options.itemClass, pageItem[it], pageItemClass.itemNum))
      }
      options.nextDisplay &&
      container.append(itemPackage(options.itemTag.split(' '), false, '', '', options.itemClass, options.nextText, pageItemClass.nextPage))
      options.lastDisplay &&
      container.append(itemPackage(options.itemTag.split(' '), false, '', '', options.itemClass, options.lastText, pageItemClass.lastPage))
    }
  }

  function ajaxPackage (pageIndex) {
    var url = formParam(pageIndex), datas = {}
    if (options.ajaxMethod.toLowerCase() == 'post') {
      datas = options.searchOption
      datas[options.pageIndexName] = pageIndex
      datas[options.pageSizeName] = options.pageSize
    }
    $.ajax({
      url: url,
      // contentType: options.ajaxContentType,
      type: options.ajaxMethod,
      data: datas,
      success: function (response) {
        if (typeof response == 'string') {
          var result = JSON.parse(response)
        } else {
          result = response
        }
        $(options.tableContainer).empty()
        if (options.needAjaxHandleData) {
          options.ajaxCallback(result)
        }
        page.refresh(result[options.responseItemCountName])
        if (!_init) {
          _init = true
          bindEvents(thisElement)
        }
      },
      error: function () {
        options.ajaxErrorCallback()
      },
      complete: function () {},
      beforeSend: function () {
        $(thisElement).find(options.itemTag).css('cursor', 'not-allowed')
        if (_init) {
          $(thisElement).find(options.containerTag).children().addClass('disabled')
        }
      }
    })
  }

  function bindEvents ($element) {
    function pageIndexChange (pageIndex) {
      options.pageIndex = pageIndex
      console.log(pageIndex)
      thisElement.trigger('pageViewChange')
      if (!options.isAjax) {
        window.location.href = formParam(pageIndex)
      } else {
        ajaxPackage(pageIndex)
      }
    }

    // 首页
    options.firstDisplay && $element.on('click', '.' + pageItemClass.firstPage + ':not(.disabled)', function (e) {
      e.preventDefault()
      options.totalCount != 0 &&
      pageIndexChange(1)
    })
    // 末页
    options.lastDisplay && $element.on('click', '.' + pageItemClass.lastPage + ':not(.disabled)', function (e) {
      e.preventDefault()
      options.totalCount != 0 &&
      pageIndexChange(data.pages)
    })
    // 上一页
    options.prevDisplay && $element.on('click', '.' + pageItemClass.prevPage + ':not(.disabled)', function (e) {
      e.preventDefault()
      options.pageIndex > 1 && options.totalCount != 0 && pageIndexChange(options.pageIndex - 1)
    })
    // 下一页
    options.nextDisplay && $element.on('click', '.' + pageItemClass.nextPage + ':not(.disabled)', function (e) {
      e.preventDefault()
      options.pageIndex < data.pages && options.totalCount != 0 && pageIndexChange(options.pageIndex + 1)
    })
    // 具体页
    $element.on('click', '.' + pageItemClass.itemNum + ':not(.disabled):not(.' + options.itemActiveClass + ')', function (e) {
      e.preventDefault()
      var $this = $(this),
        callback = true

      if ($this.hasClass('active') && !options.allowActiveClick) {
        callback = false
      }
      if (isNaN(parseInt($.trim($this.text())))) {
        callback && pageIndexChange(parseInt($.trim($this.next().text())) - 1)
      } else {
        callback && pageIndexChange(parseInt($.trim($this.text())))
      }
    })
  }

  function formParam (index) {
    var param = [], paramString
    if (options.isAjax) {
      if (!options.hasCache) {
        param.push(['&', 'tc', '=_', Date.parse(new Date())].join(''))
      }
      paramString = param.join('')
      paramString = options.url + '?' + paramString.substr(1)
      return encodeURI(paramString)
    }
    if (options.searchOption.length == 0) {
      return ''
    }
    for (var item in options.searchOption) {
      if (Object.prototype.hasOwnProperty.call(options.searchOption, item)) {
        param.push(['&', item, '=', options.searchOption[item]].join(''))
      }
    }
    param.push(['&', options.pageIndexName, '=', index].join(''))
    param.push(['&', options.pageSizeName, '=', options.pageSize].join(''))
    !options.hasCache && param.push(['&', 'tc', '=_', Date.parse(new Date())].join(''))
    paramString = param.join('')
    paramString = options.url + '?' + paramString.substr(1)
    return encodeURI(paramString)
  }

  function getUrlParam (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); // 构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); // 匹配目标参数
    if (r != null) return decodeURI(r[2])
    return null; // 返回参数值
  }

  var page = {
    init: function (initData) {
      options = page.getOption(initData)
      page.optionCheck()
      thisElement = this
      if (!options.isAjax) {
        options.pageIndex = parseInt(getUrlParam(options.pageIndexName))
        options.pageSize = parseInt(getUrlParam(options.pageSizeName))
        page.refresh(parseInt(getUrlParam(options.responseItemCountName)))
        bindEvents(thisElement)
      } else {
        ajaxPackage(options.pageIndex)
      }
      if (typeof options.onChange == 'function') {
        this.on('pageViewChange', $.proxy(options.onChange, this))
      }
    },
    getDefault: function () {
      return _DEFAULT
    },
    getOption: function (options) {
      var defaults = page.getDefault(),
        _opts = $.extend({}, defaults, options),
        opts = {}
      // 保证返回的对象内容项始终与当前类定义的DEFAULTS的内容项保持一致
      for (var i in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, i)) {
          opts[i] = _opts[i]
        }
      }
      return opts
    },
    optionCheck: function () {
      var check = true
      if (options.url == null || options.url == '') {
        $.error('需要设置url')
        check = false
      }
      if (options.isAjax && (options.responseItemCountName == null || options.responseItemCountName == '')) {
        $.error('ajax分页需要设置responseItemCountName')
        check = false
      }
      return check
    },
    refresh: function (total) {
      options.totalCount = total
      data.pages = Math.ceil(options.totalCount / options.pageSize)
      thisElement.empty()
      render(thisElement)
    },
    updateSearchOption: function (opt) {
      options.searchOption = opt
      thisElement.empty()
      if (options.isAjax) {
        ajaxPackage(1)
      }
    }
  }

  $.fn.pagination = function (method) {
    if (page[method]) {
      return page[method].apply(this, Array.prototype.slice.call(arguments, 1))
    } else if (typeof method === 'object' || !method) {
      return page.init.apply(this, arguments)
    } else {
      $.error('page中未找到方法' + method)
    }
  }
})(jQuery)
