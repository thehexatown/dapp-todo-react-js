import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Web3 from "web3";
import "./App.css";
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from "./config";
let ethereum = window.ethereum;
ethereum.enable();

function App() {
  const [account, setAccount] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [todoList, setTodoList] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [content, setContent] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS);
    setTodoList(todoList);
    const taskCount = await todoList.methods.taskCount().call();
    setTaskCount(taskCount);
    for (let i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call();
      setTasks(...tasks, [task]);
    }
    setLoading(true);
  };

  const createTask = () => {
    setLoading(false);
    todoList.methods
      .createTask(content)
      .send({ from: account })
      .once("receipt", (receipt) => {
        setLoading(true);
      });
  };

  const createToggle = (taskId) => {
    setLoading(false);
    todoList.methods
      .toggleCompleted(taskId)
      .send({ from: account })
      .once("receipt", (receipt) => {
        setLoading(true);
      });
  };

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.thehexatown.com/free-download"
          target="_blank"
        >
          TheHexaTown | Todo List
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small>
              <a className="nav-link" href="#">
                <span id="account"></span>
              </a>
            </small>
          </li>
        </ul>
      </nav>
      <div className="container-fluid">
        <div>
          <main role="main">
            <div id="content">
              <form>
                <input
                  id="newTask"
                  type="text"
                  className="form-control"
                  placeholder="Add task..."
                  onChange={(event) => setContent(event.target.value)}
                  required
                />
                <button onClick={() => createTask()}>Submit</button>
              </form>
              {loading == true && tasks.length > 0 ? (
                <ul id="taskList" className="list-unstyled">
                  {tasks.map((task, key) => {
                    return (
                      <div
                        className="taskTemplate"
                        className="checkbox"
                        key={key}
                      >
                        <label>
                          <input
                            type="checkbox"
                            defaultChecked={task.completed}
                            onClick={() => createToggle(task.id)}
                          />
                          <span className="content">{task.content}</span>
                        </label>
                      </div>
                    );
                  })}
                </ul>
              ) : null}

              <ul id="completedTaskList" className="list-unstyled"></ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
