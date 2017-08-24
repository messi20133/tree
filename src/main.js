import Vue from 'vue'

const stateMap = {
  'NOCHECK': 0,
  'PARTCHECK': 1,
  'ALLCHECK': 2,
}

Vue.component('CommonNode', {
  template: `<div class="commonnode" @click="checkNode"><span><input type="checkbox" :checked="checked"/><span>{{label}}</span></span><slot></slot></div>`,
  props: ['id', 'label', 'isChecked', 'level', 'flatLevel' ],
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
      this.$parent.hasChecked({
        id: this.id,
        checked: this.checked
      }); 
    },
    setCheck (checkedState) {
      this.checked = checkedState;
    }
  }
});

Vue.component('ParentNode', {
  template: `<div class="parentnode" @mouseleave="mouseLeave" @mouseenter="mouseEnter"><span @click="checkedAll" ><input type="checkbox" :class="{partSelect: checked == 1}"  :checked="checked == 2"/><span>{{label}}</span></span><div v-show="showPanel" :class="{dropdown:level>=flatLevel}"><slot></slot></div></div>`,
  props: ['id', 'label', 'isChecked', 'children', 'level', 'flatLevel'],
  data: function () {
    return {
      checked: this.isChecked,
      childrenList: this.children ? JSON.parse(JSON.stringify(this.children)) : [],
      showPanel: this.level < this.flatLevel 
    }
  },
  watch: {
    children (val, old) {
      this.childrenList = val ? JSON.parse(JSON.stringify(val)) : [];
    }
  },
  computed: {
    isPartChecked: function () {

    }
  },
  methods: {
    hasChecked (opt) {
      var $parent = this.$parent;
      var index = this.findItemById(opt.id);
      this.childrenList[index].checked = opt.checked;
      //获取父节点的状态
      this.checked = this.getNodeState();
      if ($parent) {
        $parent.hasChecked({
          id: this.id,
          checked: this.checked,
          childs: opt
        });
      }
    },
    checkedAll (checkedState) {
      if (this.checked == stateMap.ALLCHECK) {
        this.checked = stateMap.NOCHECK;
      } else {
        this.checked = stateMap.ALLCHECK;
      }
      this.setChildrenChecked(this.checked);
      this.$parent.hasChecked({
        id: this.id,
        checked: this.checked
      });
    },
    setChildrenChecked (checkedState) {
      this.childrenList = this.childrenList.map((item) => {
        item.checked = checkedState;
        return item;
      });
      var $children = this.$children;
      for (var i=0, l=this.children.length; i<l; i++) {
        $children[i].setCheck(checkedState);
      }
    },
    setCheck (checkedState) {
      this.checked = checkedState;
      this.setChildrenChecked(checkedState);
    },
    getNodeState () {
      var list = this.childrenList;
      if (list.every((item)=> {
        if (typeof(item.checked) == 'boolean') {
          return item.checked;
        } else {
          if (item.checked == 2) {
            return true;
          } else {
            return false;
          }
        }
      })) {
        return stateMap.ALLCHECK;
      } else if (list.some((item) => item.checked)) {
        return stateMap.PARTCHECK; 
      } else {
        return stateMap.NOCHECK;
      }
    },
    findItemById (id) {
      var index = -1;
      var list = this.childrenList;
      for(let i=0, len=list.length; i<len; i++){
        if (list[i].id == id) {
          index = i;
          break;
        }
      }
      return index;
    },
    mouseEnter (e) {
      if (this.level >= this.flatLevel) {
        this.showPanel = true;
      }
    },
    mouseLeave (e) {
      e.stopPropagation();
      if (this.level >= this.flatLevel) {
        this.showPanel = false;
      }
    }
  }
});

var loc = require('./components/loc.js');

Vue.component("TreeList", {
  render: function (h) {
    var list = this.showList(this.dataList, h, 0);
    return h('div', {
      on: {
        click: this.clickHandle
      }
    }, list);
  },
  created: function () {
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
              level: level + 1,
              flatLevel: this.flatLevel
            },
            key: item.id
          };
          var childrenArray = [];
          
          if (level > 0) {
            Object.assign(props, {
              style: {
                paddingLeft: '15px'
              }
            });
          }
          var classItem = {};
          if (level + 1 >= this.flatLevel) {
            classItem['inlineblock'] = true;
          }
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
    },
    hasChecked: function (opt) {
      this.setDataListChecked(this.dataList, opt);
    },
    setDataListChecked: function (list, opt) {
      var index = this.findItemById(list, opt.id);
      list[index].checked = opt.checked;
      if (opt.checked == 1) {
        if (opt.childs) {
          this.setDataListChecked(list[index].children, opt.childs);
        } else {
          this.collectSelected(opt.id, opt.checked);
        }
      } else {
        this.setAllChecked(list[index], opt.checked == stateMap.ALLCHECK);
      }
    },  
    setAllChecked (list, flag) {
      if (list.children) {
        list.checked = flag ? stateMap.ALLCHECK : stateMap.NOCHECK ;
        var children = list.children;
        for (let i=0, len=children.length; i<len; i++) {
          children[i].checked = flag;
          if (children[i].children) {
            this.setAllChecked(children[i], flag);
          } else {
            this.collectSelected(children[i].id, flag);
          }
        }
      } else {
        list.checked = flag;
        this.collectSelected(list.id, flag);
      }
    },
    findItemById (list, id) {
      var index = -1;
      for(let i=0, len=list.length; i<len; i++){
        if (list[i].id == id) {
          index = i;
          break;
        }
      }
      return index;
    },
    clickHandle: function () {
      console.log('sdfsdf');
    },
    collectSelected: function (id, flag) {
      var selectedData = this.selectedData;
      var index = selectedData.indexOf(id);
      if (flag) {
        selectedData.push(id);
      } else {
        selectedData.splice(index, 1);
      }
    }
  },
  data: function () {
    return {
      dataList: [loc],
      selectedData: [],
      flatLevel: 4  
    }
  }
});
require('./app.css');
new Vue({
  el: '#app',
  template: '<div class="treelistArea"><TreeList/></div>',
  methods: {
  }
})
