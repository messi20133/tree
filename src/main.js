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
  props: ['id', 'label', 'isChecked' ],
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
  template: `<div class="parentnode"><span @click="checkedAll"><input type="checkbox" :checked="checked"/><span>{{label}}</span></span><slot></slot></div>`,
  props: ['id', 'label', 'isChecked', 'children'],
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
    }
  }
});

var loc = require('./components/loc.js');

Vue.component("TreeList", {
  render: function (h) {
    var list = this.showList(this.dataList, h);
    return h('div', {}, list);
  },
  methods: {
    showList: function (data, h) {
      if (Array.isArray(data)) {
        var result = [];
        for (var i=0, len = data.length; i < len ; i ++) {
          var item = data[i];
          var props = {
            props: {
              id: item.id,
              label: item.label,
              children: item.children,
              isChecked: !!item.isChecked    
            }
          };
          var childrenArray = [];
          
          Object.assign(props, {
            style: {
              paddingLeft: '10px'
            }
          });
          if (item.children) {
            childrenArray.push(this.showList(item.children, h));
            Object.assign(props, {
              class: {
                is_parent: true 
              }, 
            });
            result.push(h("ParentNode", props, childrenArray)); 
          } else {
            Object.assign(props, {
              class: {
                is_leaf: true 
              }
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
