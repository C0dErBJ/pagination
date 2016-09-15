# pagination
*一个简单的前端分页* 

*借鉴* [pageView]

[pageView]: https://github.com/liuyunzhuge/blog/blob/master/form/src/js/mod/pageView.js

> 依赖Jquery，Bootstrap

# 如何使用
###Html
>```html
> <div class="fenye" id="pagination">
> </div>
### JS
>```javascript
><script>
> $("#pagination").pagination({
>           url: "/productlibrary/page.htm",
>           searchOption: {
>               productName: $("select option:selected").val(),
>               keyword: $("#productname").val()
>           },
>           ajaxCallback: function (data) {
>               console.log(data)
>               if (data.list.length == 0) {
>                   $("table tbody").append("<tr class=\"pointer\">\n" +
>                           " <td class=\"a-center \" colspan=\"7\">未找到数据</td>\n" +
>                           " </tr>")
>               }
>               data.list.forEach(function (e) {
>                   $("table tbody").append("<tr class=\"pointer\">\n" +
>                           " <td class=\"a-center \">" + e.productname + "</td>\n" +
>                           " <td>" + e.salesstatus + "</td>\n" +
>                           " <td>" + e.sellingstage + "</td>\n" +
>                           " <td>" + e.totalaccount + "</td>\n" +
>                           " <td>" + e.sellingstage + "</td>\n" +
>                           " <td>" + e.issingscale + "</td>\n" +
>                           " <td><a href=\"/productlibrary/" + e.id + "\">查看详情</a></td>\n" +
>                           " </tr>")
>
>               })
>           },
>           ajaxErrorCallback: function () {
>               $("table tbody").append("<tr class=\"pointer\">\n" +
>                       " <td class=\"a-center \" colspan=\"7\">未找到数据</td>\n" +
>                       " </tr>")
>           }
>       });

###默认参数
>```javascript
> {
>   pageIndex: 1,//默认页
>   pageSize: 10,//默认分页大小
>   pageIndexName: 'page',//分页参数名称
>   pageSizeName: 'pageSize',//分页大小参数名称
>   onChange: $.noop,//分页改变或分页大小改变时的回调
>   allowActiveClick: true,//控制当前页是否允许重复点击刷新
>   middlePageItems: 4,//中间连续部分显示的分页项
>   frontPageItems: 2,//分页起始部分最多显示2个分页项，否则就会出现省略分页项
>   backPageItems: 2,//分页结束部分最多显示2个分页项，否则就会出现省略分页项
>   ellipseText: '...',//中间省略部分的文本
>   prevText: '上一页',
>   nextText: '下一页',
>   prevDisplay: true,//是否显示上一页按钮
>   nextDisplay: true,//是否显示下一页按钮
>   firstText: '首页',
>   lastText: '尾页',
>   firstDisplay: true,//是否显示首页按钮
>   lastDisplay: true,//是否显示尾页按钮
>   totalCount: 0,//总条数
>   isAlwaysShow: false,//当没有数据时是否显示分页
>   isAjax: true,//是否是ajax分页
>   containerTag: "ul",//分页容器
>   itemTag: "li a",//分页项
>   containerClass: "pagination",//容器样式
>   containerStyle: "margin-top: 0px",//容器style
>   itemActiveClass: "active",//选中状态样式
>   itemClass: "",//一般样式
>   searchOption: {},//搜索条件
>   url: "",//分页url
>   hasCache: false,//是否需要缓存
>   ajaxCallback: $.noop,//ajax回调
>   ajaxErrorCallback: $.noop,//ajax错误回调
>   ajaxMethod: "POST",//ajax提交方法
>   responseItemCountName: "total",//返回数据总条数名称
>   tableContainer: "table tbody",//数据表格标签
>  }

