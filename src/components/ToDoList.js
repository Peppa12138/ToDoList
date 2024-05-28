import { List, Checkbox, Button, Input, DatePicker, message, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { useEffect, useState } from "react";
import "./ToDoList.css";

export default function ToDoList() 
{
  const [lists, setLists] = useState()
  const [task, setTasks] = useState("")
  const [deadline, setDeadline] = useState("")
  const [messageApi, contextHolder] = message.useMessage()
  // 使用useRef可能会更好，但是是按顺序排列的
  const [idCounter, setIdCounter] = useState(1)

  // 用于设置初始的 lists 状态,运行一次就行，之后不要每渲染一次就执行一次
  useEffect(() => {setLists([])}, [])

  // 执行任务添加的操作
  function addTask() 
  {
    if (lists) 
    {
      if (task !== "" && deadline) 
      {
        // 运用数组展开运算符，展开数组元素，添加新对象作为元素
        setLists([...lists, { id: idCounter,task, deadline, finished: false }])
        // 复原任务栏
        setDeadline(null)
        // 更新任务框状态
        setTasks("")
        // 更新最新的id
        setIdCounter(idCounter+1)
        // 弹出添加成功的消息
        messageApi.success("添加成功")
      } 
      else
      {
        // 根据实际情况弹出对应的窗口提示
        if (!deadline && task === "") 
        {
          messageApi.error("请填写任务并提供截止时间")
        } 
        else if (task === "") 
        {
          messageApi.error("请填写任务")
        } 
        else
        {
          messageApi.error("请提供截止时间")
        }
      }
    }
  }

  // 任务删除操作
  function deleteTask(id) 
  {
    if (lists) 
    {
      // 创建一个新数组，不直接对state中的数组进行修改
      let temp = []
      for (let i = 0; i < lists.length; i++)
      {
        // 将不是需要删除的任务放进新数组中
        if (lists[i].id !== id) 
        {
          temp.push(lists[i])
        } 
      }
      // 将新数组传入setLists中来更新state中的数组
      setLists(temp)
    }
  }
  
  // 操作之外的操作：确认是否删除
  function confirmDelete(id,task) 
  {
    // 借助Modal组件进行是否确认删除的操作
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除任务${task}吗？`,
      okText: "确认",
      cancelText: "取消",
      // 按下确认后即会执行删除操作，不确认不删除
      onOk: () => {deleteTask(id)}
    })
  }
  
  // 确认删除线操作
  function checkTask(id, check) 
  {
    if (lists) 
    {
      // 创建一个新数组，采用map方法对原数组的元素进行处理
      const newLists = lists.map((e) => 
      {
        // 找到已经完成的任务后，返回一个元素，该元素由原元素展开并更改了finished属性的值得来
        if (e.id === id) 
        {
          return { ...e, finished: check }
        }
        // 不是已经完成的任务，则不作修改，保持原样
        return e
      })
      // 使用新数组来更新状态
      setLists(newLists)
    }
  }
  

  return (
    <div className="to-do-list">
      {contextHolder}
      <h1 id="title">To Do List</h1>
      <div>
        <Input
          placeholder="请输入任务名称"
          // 每一次成功的添加之后都会将task的值置为""以来更新输入框
          value={task}
          // 每一次变化都会更新state中的task
          onChange={(e) => {
            setTasks(e.target.value)
          }}
        />
        <DatePicker
          placeholder="请选择截止时间"
          // 禁止输入，仅允许在弹窗中勾选
          inputReadOnly={true}
          value={deadline ? moment(deadline) : null}
          onChange={(date) => {
            setDeadline(date ? date.toString() : null)
          }}
        />
        <Button type="primary" onClick={addTask}>
          添加
        </Button>
      </div>
      <List
        // 确认数据的获取来源
        dataSource={lists}
        renderItem={(list) => (
          <List.Item
          // 为每一条任务添加勾选框和删除栏
            actions={[
              <Checkbox
              // 勾选状态有变化时，根据勾选框的状态传入对应的值，来对对应元素添加删除线
                onChange={(e) => {
                  checkTask(list.id,e.target.checked)
                }}
              />,
              // 添加删除按钮，并添加响应事件
              <DeleteOutlined onClick={() => confirmDelete(list.id,list.task)} />
            ]}
          >
            <div
              //任务主体部分 确定是否逾期 根据状态来输出任务
              className={`${list.finished ? "finished" : ""} ${moment(list.deadline).isBefore(moment(), "day") ? "timeout" : ""}`}
            >
            <div>{list.task}</div>
            <div>截止时间：{moment(list.deadline).format("YYYY-MM-DD")}</div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}
