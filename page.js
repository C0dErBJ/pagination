/**
 * Created by C0dEr on 16/9/14.
 */
;(function ($) {
  var _DEFAULT = {
    pageIndex: 1, // 默认页
    pageSize: 10, // 默认分页大小
    pageIndexName: 'page', // 分页参数名称
    pageSizeName: 'pageSize', // 分页大小参数名称
    pageCountNumName: 'pageCountNum', // 页数
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
    containerTag: 'ul', // 分页容器
    itemTag: 'li a', // 分页项
    containerClass: 'pagination', // 容器样式
    containerStyle: 'margin-top: 0px', // 容器style
    itemActiveClass: 'active', // 选中状态样式
    itemClass: '', // 一般样式
    onChange: $.noop, // 分页切换回调函数
    descriptionTemplate: '当前第${pageIndexName}页，每页展示${pageSizeName}条,一共${pageCountNumName}页', // 描述模板
    needDescription: false
  }
  var pageItemClass = {
    'firstPage': 'firstpage',
    'prevPage': 'prevpage',
    'itemNum': 'itemnum',
    'nextPage': 'nextpage',
    'lastPage': 'lastpage'
  }
  /**
   * 获取连续部分的起止索引
   */
  function getInterval (options) {
    var ne_half = Math.ceil(options.middlePageItems / 2)
    var np = options.pages
    var upper_limit = np - options.middlePageItems
    var start = options.pageIndex > ne_half ? Math.max(Math.min(options.pageIndex - ne_half, upper_limit), 0) : 0
    var end = options.pageIndex > ne_half ? Math.min(options.pageIndex + ne_half, np) : Math.min(options.middlePageItems, np)
    return [start, end]
  }

  function render (element) {
    var options = $(element).data()
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
        tags.length == 0 && ((options.pageIndex == options.pages && (index == options.lastText || index == options.nextText)) ||
        (options.pageIndex == 1 && (index == options.firstText || index == options.prevText))) ? ' disabled ' : '',
        ' ',
        isActive && tags.length == 0 ? itemActiveClass + "'" : " '",
        t.toLowerCase() == 'a' ? "href='javascript:;' " : '',
        " style='",
        tags.length == 0 && ((options.pageIndex == options.pages && (index == options.lastText || index == options.nextText)) ||
        (options.pageIndex == 1 && (index == options.firstText || index == options.prevText))) ? 'cursor:not-allowed' : '',
        "'>",
        html == null || html == '' ? index : html,
        '</', t,
        '>'
      ].join(''))
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
      var interval = getInterval(options)
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
      if (interval[1] < options.pages && options.backPageItems > 0) {
        if (options.pages - options.backPageItems > interval[1] && options.ellipseText) {
          items.push(options.ellipseText)
        }
        var begin = Math.max(options.pages - options.backPageItems, interval[1])
        for (var i = begin; i < options.pages; i++) {
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

      options.needDescription && container.prepend(options.descriptionTemplate.replace('${' + options.pageIndexName + '}', options.pageIndex).replace('${' + options.pageSizeName + '}', options.pageSize).replace('${' + options.pageCountNumName + '}', options.totalCount))
    }
  }

  function bindEvents ($element) {
    function pageIndexChange (pageIndex) {
      $($element).data().pageIndex = pageIndex
      $($element).trigger('pageViewChange')
      page.refresh($element)
      
    }
    var options = $($element).data()
    // 首页
    options.firstDisplay && $($element).find('.' + pageItemClass.firstPage + ':not(.disabled)').on('click', function (e) {
      e.preventDefault()
      options.totalCount != 0 &&
      pageIndexChange(1)
    })
    // 末页
    options.lastDisplay && $($element).find('.' + pageItemClass.lastPage + ':not(.disabled)').on('click', function (e) {
      e.preventDefault()
      options.totalCount != 0 &&
      pageIndexChange(options.pages)
    })
    // 上一页
    options.prevDisplay && $($element).find('.' + pageItemClass.prevPage + ':not(.disabled)').on('click', function (e) {
      e.preventDefault()
      options.pageIndex > 1 && options.totalCount != 0 && pageIndexChange(options.pageIndex - 1)
    })
    // 下一页
    options.nextDisplay && $($element).find('.' + pageItemClass.nextPage + ':not(.disabled)').on('click', function (e) {
      e.preventDefault()
      options.pageIndex < options.pages && options.totalCount != 0 && pageIndexChange(options.pageIndex + 1)
    })
    // 具体页
    $($element).find('.' + pageItemClass.itemNum + ':not(.disabled)').on('click', function (e) {
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
  function getOption (options) {
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
  }
  var page = {
    init: function (initData) {
      options = getOption(initData)
      page.optionCheck(options)
      options.thisElement = this
      $(this).data(options)
      page.refresh(this)
      if (typeof options.onChange == 'function') {
        this.on('pageViewChange', function () {
          var options = $(this).data()
          options.onChange.call(options.onChange, options.pageIndex, options.pageSize)
        })
        $(this).trigger('pageViewChange')
      }
    },
    getDefault: function () {
      return _DEFAULT
    },
    optionCheck: function (options) {
      var check = true
      if (options.totalCount == undefined || options.totalCount == 0) {
        $.error('需要设置totalcount总条数')
      }
      return check
    },
    refresh: function ($element) {
      options = $($element).data()
      options.pages = Math.ceil(options.totalCount / options.pageSize)
      $($element).empty()
      render($element)
      bindEvents($element)
    },
    changePage: function (pageIndex) {
      $(this).data().pageIndex = pageIndex
      $(this).trigger('pageViewChange')
      page.refresh(this)
    },
    resetOptions: function (options) {
      page.init(options)
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
