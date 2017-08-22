// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import App from './App'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-default/index.css'
// import {Tree} from 'element-ui'
// Vue.use(Tree)
// Vue.config.productionTip = false



//require('./components/tree.js')(Vue);

Vue.component('CommonNode', {
  template: `<div class="commonnode" @click="checkNode"><span><input type="checkbox" :checked="checked"/><span>{{label}}</span></span><slot></slot></div>`,
  props: ['id', 'label', 'isChecked', 'level' ],
  data: function () {
    return {
      checked: this.isChecked
    }
  },
  watch: {
    isChecked: function (val, oldVal) {
      if (val != oldVal) {
        this.checked = this.isChecked;
      }
    }
  },
  methods: {
    checkNode () {
      this.checked = !this.checked;
      this.$parent.hasChecked();
    }
  }
});

Vue.component('ParentNode', {
  template: `<div class="parentnode"><span @click="checkedAll" @mouseleave="mouseLeave" @mouseenter="mouseEnter"><input type="checkbox" :checked="checked"/><span>{{label}}</span></span><div><slot></slot></div></div>`,
  props: ['id', 'label', 'isChecked', 'children', 'level'],
  data: function () {
    return {
      checked: this.isChecked
    }
  },
  computed: {
    isPartChecked: function () {

    }
  },
  methods: {
    hasChecked () {
      console.log('sd');
    },
    checkedAll () {
      this.checked = !this.checked;
      this.setChildrenChecked(this.checked);
    },
    setChildrenChecked (flag) {
      var newChildren =  this.children.map(function(item){
        item.isChecked = flag; 
        return $.extend(true, {}, item)
      });
      this.children = newChildren;
    },
    mouseEnter () {
      if (this.level == 4) {
        var root = $(this.$el);
        var offsetObj = root.offset();
        root.find('>div').css({
          position: 'absolute',
          left: (root.width() + offsetObj.left) + 'px',
          top: offsetObj.top + 'px',
        }).show();
      }
    },
    mouseLeave () {
      if (this.level == 4) {
        var root = $(this.$el);
        root.find('>div').css({
          position: 'static',
        }).hide();
      }
    }
  }
});

var loc = require('./components/loc.js');

Vue.component("TreeList", {
  render: function (h) {
    var list = this.showList(this.dataList, h, 0);
    return h('div', {}, list);
  },
  created: function () {
    this.$nextTick(() => {
      var $root = $(this.$el);
      $root.find('.level_3>div>.level_4').css('display', 'inline-block');
      $root.find('.level_3>div>.level_4>div').hide();
    });
  },
  methods: {
    showList: function (data, h, level) {
      if (Array.isArray(data)) {
        var result = [];
        for (var i=0, len = data.length; i < len ; i ++) {
          var item = data[i];
          var props = {
            props: {
              id: item.id,
              label: item.label,
              children: item.children,
              isChecked: !!item.isChecked,
              level: level + 1
            }
          };
          var childrenArray = [];
          
          Object.assign(props, {
            style: {
              paddingLeft: '15px'
            }
          });
          var classItem = {};
          if (item.children) {
            level++;
            classItem['level_' + level] = true;
            Object.assign(props, {
              class: classItem, 
            });
            childrenArray.push(this.showList(item.children, h, level));
            level--;
            result.push(h("ParentNode", props, childrenArray)); 
          } else {
            classItem['level_' + (level + 1)] = true;
            Object.assign(props, {
              class: classItem
            });
            result.push(h("CommonNode", props, childrenArray)); 
          }
        }
        return result;    
      }
    }
  },
  data: function () {
    return {
      dataList: [loc]  
    }
  }
});


/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<div><TreeList/></div>',
})
