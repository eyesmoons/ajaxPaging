(function($){
	var handles = {
		init: function(options){
			var settings = $.extend({},$.fn.defaults,options);
			var _this = $(this);
			_this.data("options",settings);
			handles.pageData(_this);
		},
		pageData: function(_this){
			var opts = _this.data("options");
			var _current = opts.current;
			var _url = opts.url;
			var _params = opts.params;
			var t = opts.totalData, p = opts.pageData, ajaxOpts = null;
			if(_url!=='' && typeof(_url)==='string'){
				_params.page=_current;
				ajaxOpts = handles.ajaxData(_url,_params,_current);
				t = opts.totalData = ajaxOpts.total;
				if(opts.callBack && typeof(opts.callBack)==='function'){
					opts.callBack(ajaxOpts.rows)
				}else{
					console.log("no callBack function found");
				}
			}else{
				console.log("url required");
			}
			opts.pageCount = (t%p === 0) ? parseInt(t/p) : parseInt(t/p)+1;
            if(opts.pageCount>0){
            	_this.data("options",opts);
            	handles.pager(_this);
            }
		},
		ajaxData: function(_url,_params,_current){
			var _total = $.fn.defaults.totalData;
			return (function(){
				var data = {'total':_total,'rows':[]};
				$.ajax({
					url: _url,
					type: 'get',
					data: _params,
	                dataType: 'json',
	                cache : false,  
        			async : false,
	                success: function(result) {
	                	if(result.total && (result.total!==0)){
	                		data['total'] = result.total;
	                		data['rows'] = result.rows;
	                	}else{
	                		console.log("no data");
	                	}
	                },
					error: function() {
						console.log("server error");
					}
				})
				return data;
			})();
		},
		pager: function(_this){
			var opts = _this.data("options");
			var _page = opts.pageCount;
			var _current = opts.current;
 
			var _middle = parseInt(opts.pageStep/2);
			var _tep = _middle-2;
			var _html = '';
			if(_page>opts.pageStep&&_current<=_page){
				_html += handles.setPrev(opts, 'prev');
				if(_current<=_middle){
					_html += handles.forEach(1, opts.pageStep, _current, opts.active);
					_html += handles.elliPsis();
				}else if(_current>_middle&&_current<(_page-_tep)){
					_html += handles.pageBtn(1);
					_html += handles.elliPsis();
					_html += handles.forEach(_current-_tep, _current-(-_tep)-(-1), _current, opts.active);
					_html += handles.elliPsis();
				}else if(_current>=(_page-_tep)){
					_html += handles.pageBtn(1);
					_html += handles.elliPsis();
					_html += handles.forEach(_page-2*_tep-1, _page-(-1), _current, opts.active);
				}
				_html += handles.setNext(opts, 'next');
			}else if(_page<=opts.pageStep){
				if(_page>opts.minPage){
					_html += handles.setPrev(opts, 'prev');
				}
				_html += handles.forEach(1, _page-(-1), _current, opts.active);
				if(_page>opts.minPage){
					_html += handles.setNext(opts, 'next');
				}	
			}
			_this.html(_html);
			handles.bindEvent(_this);
		},
		setPrev: function(_opts){
			var str = '';
			if(_opts.btnShow){
				str += handles.addBtn(_opts.firstBtn, 1); 
			}
			if(_opts.btnBool){
				str += handles.addBtn(_opts.prevBtn, _opts.current-1, _opts.pageCount);
			}
			return str;
		},
		setNext: function (_opts){
			var str = '';
			if(_opts.btnBool){
				str += handles.addBtn(_opts.nextBtn, _opts.current-(-1), _opts.pageCount);
			}
			if(_opts.btnShow){
				str += handles.addBtn(_opts.lastBtn, _opts.pageCount);
			}
			return str;
		},
		addBtn: function(_property, _page, _count){
			var disabled = '';
			if(_count){
				disabled = (_page === 0 || _page === _count-(-1)) ? 'disabled="true"':'';
			}
			return '<a class="'+_property+'" page-id="'+_page+'" '+disabled+'></a>';
		},
		bindEvent: function(_v){
			var o = _v.data("options");
			var _a = _v.find("a");
			$.each(_a,function(index,item){
				var _this = $(this);
				_this.on("click",function(){
					if(_this.attr("disabled")){
						return false;
					}
					var _p = _this.attr("page-id");
					o.current = _p;
					_v.data("options",o);
					handles.pageData(_v, _p);
				})
			})
		},
		forEach: function(_start,length,_current,curclass){
			var s = '';
			for(var i = _start;i<length;i++){
				if(i === parseInt(_current)){
					s += handles.pageCurrent(i,curclass);
				}else{
					s += handles.pageBtn(i);
				}
			}
			return s;
		},
		pageCurrent: function(_id,_class){
			return '<span class="'+_class+'" page-id="'+_id+'">'+_id+'</span>';
		},
		elliPsis: function(){
			return '<span class="els">...</span>';
		},
		pageBtn: function(_id){
			return '<a page-id="'+_id+'">'+_id+'</a>';
		},
		/**
		 * 高亮显示文字
		 */
		highLightKeywords: function (text, words, tag){
			// 默认的标签，如果没有指定，使用span
			tag = tag || 'font';
			var re;
			//匹配每一个特殊字符 ，进行转义
			var specialStr = ["*", ".", "?", "+", "$", "^", "[", "]", "{", "}", "|", "\\", "(", ")", "/", "%"]; 
			$.each(specialStr, function(i, item) {
				if(words && words.indexOf(item) != -1) {
				    words = words.replace(new RegExp("\\" + item, 'g'), "\\" + item);
				}
			});
			//匹配整个关键词
			re = new RegExp(words, 'g');
			if(re.test(text)) {
			    text = text.replace(re, '<' + tag + ' style="color:red;width: auto;height: auto;line-height: 1;">$&</' + tag + '>');
			}
			return text;
		}
	}
	$.fn.extend({
		ajaxPager:function(options){
			return handles.init.apply(this, arguments);
		}
	})
	$.fn.defaults = {
		totalData: 10, //数据总条数
		pageData: 4, //每页数据条数
		pageCount: 0, //总页数
		current: 1, //当前页码数
		pageStep: 10, //当前可见最多页码个数
		minPage: 5, //最小页码数，页码小于此数值则不显示上下分页按钮
		active: 'current', //当前页码样式
		prevBtn: 'pg-prev', //上一页按钮
		nextBtn: 'pg-next', //下一页按钮
		btnBool: true, //是否显示上一页下一页
		firstBtn: 'pg-first', //第一页按钮
		lastBtn: 'pg-last', //最后一页按钮
		btnShow: true, //是否显示第一页和最后一页按钮
		disabled: true, //按钮失效样式
		ajaxSetData: true, //是否使用ajax获取数据 此属性为真时需要url和htmlBox不为空
		url: '', //ajax路由
		params: '',//ajax参数
		htmlBox: '' //ajax数据写入容器
	}
})(jQuery)