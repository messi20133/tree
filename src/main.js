import Vue from 'vue'
const stateMap = {
  'NOCHECK': 0,
  'PARTCHECK': 1,
  'ALLCHECK': 2,
}
Vue.component('CommonNode', {
  template: `<div class="commonnode" @click="checkNode"><span><input type="checkbox" :checked="checked" :disabled="!!disabled"/><span>{{node.label}}</span></span><slot></slot></div>`,
  props: ['node', 'disabled', 'level', 'flatLevel' ],
  data: function () {
    return {
      checked: this.node.isChecked
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
      if (this.disabled) {
        return;
      } 
      this.checked = !this.checked;
      this.$parent.hasChecked({
        id: this.node.id,
        checked: this.checked
      }); 
    },
    setCheck (checkedState) {
      this.checked = checkedState;
    }
  }
});

Vue.component('ParentNode', {
  template: `<div class="parentnode" @mouseleave="mouseLeave" @mouseenter="mouseEnter"><span @click="checkedAll" ><input type="checkbox" :class="{partSelect: checked == 1}" :disabled="disabled"  :checked="checked == 2"/><span>{{node.label}}</span></span><div v-show="showPanel" :class="{dropdown:level>=flatLevel}"><slot></slot></div></div>`,
  props: ['node', 'disabled',  'level', 'flatLevel'],
  data: function () {
    return {
      checked: this.node.isChecked,
      childrenList: this.node.children ? JSON.parse(JSON.stringify(this.node.children)) : [],
      showPanel: this.level < this.flatLevel 
    }
  },
  watch: {
    children (val, old) {
      this.childrenList = val ? JSON.parse(JSON.stringify(val)) : [];
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
          id: this.node.id,
          checked: this.checked,
          childs: opt
        });
      }
    },
    checkedAll (checkedState) {
      if (this.disabled) {
        return;
      } 
      if (this.checked == stateMap.ALLCHECK) {
        this.checked = stateMap.NOCHECK;
      } else {
        this.checked = stateMap.ALLCHECK;
      }
      this.setChildrenChecked(this.checked);
      this.$parent.hasChecked({
        id: this.node.id,
        checked: this.checked
      });
    },
    setChildrenChecked (checkedState) {
      this.childrenList = this.childrenList.map((item) => {
        item.checked = checkedState;
        return item;
      });
      var $children = this.$children;
      for (var i=0, l=this.node.children.length; i<l; i++) {
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
var interest = require('./components/interset.js');
var channel = require('./components/channel.js');
var num = 1;
Vue.component("TreeList", {
  render: function (h) {
    console.log("render:" + num);
    var list = this.showList(this.dataList, h, 0);
    return h('div', {
      on: {
        'click': this.clickHandle
      },
      key: 'mykey' 
    }, list);
  },
  created: function () {
    //创建叶子节点列表， 方便后面的查找。
    this.createLeafList(this.dataList);
    // 循环设置选中状态
    for (let i=0,len=this.selectedData.length; i<len; i++) {
      var item = this.selectedData[i];
      var target = this.leafList.filter((leaf, i)=>{
        return leaf.id == item;
      });
      if (target[0]) {
        target[0].checked = true;
      }
    }
    this.setParentChecked(this.dataList[0]);
    this.dataList = JSON.parse(JSON.stringify(this.dataList));
    var that = this;
    setTimeout(function () {
      var root = that.dataList[0];
      root.sub[0].sub[1].sub[1].checked= true;
      //delete root.sub[0].sub[1].sub;
      that.dataList = JSON.parse(JSON.stringify(that.dataList));
      debugger;
    }, 5000);
  },
  methods: {
    m1: function () {
      alert('ddddd');
      this.s1(this.dataList, null,  0);
      debugger;
    },
    s1: function (root, parent, level) {
      var childrenIdentify = this.children;
      var idIdentify = this.id;
      var labelIdentity = this.label;
      this.result[level + 1] = this.result[level + 1] || [];
      for(var i=0,len=root.length; i<len; i++){
        var item = root[i];
        if (item[childrenIdentify]) {
          if(item.checked ==  stateMap.ALLCHECK) {
            var temp = {};
            temp[idIdentify] = item[idIdentify];
            temp[labelIdentity] = item[labelIdentity];
            if (parent && parent.checked == stateMap.ALLCHECK) {
              temp['parentchecked'] = true;  
            }
            this.result[level + 1].push(temp);                      
          }
          this.s1(item[childrenIdentify], item, level+1);
        } else {
          if (item.checked){
            var temp = {};
            temp[idIdentify] = item[idIdentify];
            temp[labelIdentity] = item[labelIdentity];
            this.result[level + 1].push(temp);
            if (parent && parent.checked == stateMap.ALLCHECK) {
              temp['parentchecked'] = true;  
            }
          }
        }      
      }    
    },
    clickHandle: function () {
      console.log(this.selectedData);
    },
    showList: function (data, h, level) {
      if (Array.isArray(data)) {
        var result = [];
        for (var i=0, len = data.length; i < len ; i ++) {
          var item = data[i];
          var props = {
            props: {
              node: {
                id: item[this.id],
                label: item[this.label],
                children: item[this.children],
                isChecked: item.checked,
              },
              disabled: this.disabled,
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
          if (item[this.children]) {
            level++;
            classItem['level_' + level] = true;
            Object.assign(props, {
              class: classItem, 
            });
            childrenArray.push(this.showList(item[this.children], h, level));
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
      var idIdentify = this.id;
      var childrenIdentify = this.children;
      var index = this.findItemById(list, opt[idIdentify]);
      list[index].checked = opt.checked;
      if (opt.checked == 1) {
        if (opt.childs) {
          this.setDataListChecked(list[index][childrenIdentify], opt.childs);
        } else {
          this.collectSelected(opt[idIdentify], opt.checked);
        }
      } else {
        this.setAllChecked(list[index], opt.checked == stateMap.ALLCHECK);
      }
    },  
    setAllChecked (list, flag) {
      var idIdentify = this.id;
      var childrenIdentify = this.children;
      if (list[childrenIdentify]) {
        list.checked = flag ? stateMap.ALLCHECK : stateMap.NOCHECK ;
        var children = list[childrenIdentify];
        for (let i=0, len=children.length; i<len; i++) {
          children[i].checked = flag;
          if (children[i][childrenIdentify]) {
            this.setAllChecked(children[i], flag);
          } else {
            this.collectSelected(children[i][idIdentify], flag);
          }
        }
      } else {
        list.checked = flag;
        this.collectSelected(list[idIdentify], flag);
      }
    },
    findItemById (list, id) {
      var index = -1;
      for(let i=0, len=list.length; i<len; i++){
        if (list[i][this.id] == id) {
          index = i;
          break;
        }
      }
      return index;
    },
    collectSelected: function (id, flag) {
      var selectedData = this.selectedData;
      var index = selectedData.indexOf(id);
      if (flag) {
        selectedData.push(id);
      } else {
        selectedData.splice(index, 1);
      }
    },
    createLeafList (list, parent) {
      var children = this.children;
      for (var i=0,len=list.length; i<len; i++) {
        var item = list[i];
        if (parent){
          item.parent = parent;
        }
        if (item[children]) {
          parent = JSON.parse(JSON.stringify(item));
          delete parent[children];
          this.createLeafList(item[children], parent);
        } else {
          this.leafList.push(item);
        }
      }
    },
    checkStatus: function (list) {
      var len = list.length;
      while(len--){
        if (typeof(list[len]) == "boolean") {
          list[len] = list[len] ? 1: 0;
        }
        if (typeof(list[len]) == "undefined") {
          list[len] = list[len] ? 1: 0;
        }
      }
      var unique = [... new Set(list)];
      if (unique.length > 1 || (unique.length == 1 && unique[0] ==stateMap.PARTCHECK)) {
          return stateMap.PARTCHECK;
      } else {
        if (unique[0]) {
          return stateMap.ALLCHECK;
        } else {
          return stateMap.NOCHECK;
        }
      }
    },
    setParentChecked (root) {
      var result = [];
      var children = this.children;
      if(root[children]) {
        for(let i=0,len=root[children].length;i<len;i++){
          var item = root[children][i];
          if (item[children]) {
            result.push(this.setParentChecked(item));
          } else {
            result.push(item.checked);
          }
        }
        root.checked = this.checkStatus(result)
        return root.checked;
      } else {
        return root.checked;
      } 
      
    },
  },
  data: function () {
    // return {
    //   dataList: [loc],
    //   selectedData: [155,333,1,2,48,199,317,91,34,35,36],
    //   flatLevel: 3 ,
    //   leafList: [],
    //   disabled: false,
    //   id: 'id',
    //   children: 'children',
    //   label: 'label'
    // }
    ////===================================================
    // return {
    //   dataList: [interest.list[0]],
    //   selectedData: [],
    //   flatLevel: 2 ,
    //   leafList: [],
    //   disabled: false,
    //   id: 'id',
    //   children: 'sub',
    //   label: 'name'
    // }
    ////===================================================
    return {
      dataList: [channel],
      selectedData: ['promotion', 'c5', 't168', 'e4381', 'u757', 'u649', 'u716'],
      flatLevel: 4 ,
      leafList: [],
      disabled: false,
      id: 'id',
      children: 'sub',
      label: 'name',
      result: []
    }
  }
});
require('./app.css');
const tpl = `
  <div class="treelistArea">
    <TreeList ref="tree"/>
    <button @click="clickMe">点击</button>
  </div>
`;
new Vue({
  el: '#app',
  template: tpl,
  methods: {
    clickMe () {
      this.$refs.tree.m1();
    }
  }
})
