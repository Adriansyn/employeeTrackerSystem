const inquirer = require('inquirer');
const db = require('./database/connection');

const init = async () => {
  try {
    await db.connect();
    console.log('Database connected.');
    employeeTracker();
  } catch (err) {
    throw err;
  }
};

const employeeTracker = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'prompt',
        message: 'What would you like to do?',
        choices: [
          'View All Department',
          'View All Roles',
          'View All Employees',
          'Add A Department',
          'Add A Role',
          'Add An Employee',
          'Update An Employee Role',
          'Log Out'
        ]
      }
    ])
    .then(handlePrompt);
};

const handlePrompt = ({ prompt }) => {
  switch (prompt) {
    case 'View All Department':
      viewAllDepartments();
      break;
    case 'View All Roles':
      viewAllRoles();
      break;
    case 'View All Employees':
      viewAllEmployees();
      break;
    case 'Add A Department':
      addDepartment();
      break;
    case 'Add A Role':
      addRole();
      break;
    case 'Add An Employee':
      addEmployee();
      break;
    case 'Update An Employee Role':
      updateEmployeeRole();
      break;
    case 'Log Out':
      close();
      break;
    default:
      console.log('Invalid choice.');
      employeeTracker();
  }
};

const viewAllDepartments = () => {
  db.query('SELECT * FROM department', (err, result) => {
    if (err) throw err;
    console.log('Viewing All Departments: ');
    console.table(result);
    employeeTracker();
  });
};

const viewAllRoles = () => {
  db.query('SELECT * FROM role', (err, result) => {
    if (err) throw err;
    console.log('Viewing All Roles: ');
    console.table(result);
    employeeTracker();
  });
};

const viewAllEmployees = () => {
  db.query('SELECT * FROM employee', (err, result) => {
    if (err) throw err;
    console.log('Viewing All Employees: ');
    console.table(result);
    employeeTracker();
  });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'department',
        message: 'What is the name of the department?',
        validate: departmentInput => {
          return departmentInput.trim() !== '';
        }
      }
    ])
    .then(({ department }) => {
      db.query('INSERT INTO department (name) VALUES (?)', [department], (err, result) => {
        if (err) throw err;
        console.log(`Added ${department} to the database.`);
        employeeTracker();
      });
    });
};

const addRole = () => {
  db.query('SELECT * FROM department', (err, result) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'role',
          message: 'What is the name of the role?',
          validate: roleInput => {
            return roleInput.trim() !== '';
          }
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary of the role?',
          validate: salaryInput => {
            return salaryInput.trim() !== '';
          }
        },
        {
          type: 'list',
          name: 'department',
          message: 'Which department does the role belong to?',
          choices: result.map(row => row.name)
        }
      ])
      .then(({ role, salary, department }) => {
        const departmentId = result.find(row => row.name === department).id;
        db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [role, salary, departmentId], (err, result) => {
          if (err) throw err;
          console.log(`Added ${role} to the database.`);
          employeeTracker();
        });
      });
  });
};

const addEmployee = () => {
  db.query('SELECT * FROM employee, role', (err, result) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'firstName',
          message: "What is the employee's first name?",
          validate: firstNameInput => {
            return firstNameInput.trim() !== '';
          }
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is the employee's last name?",
          validate: lastNameInput => {
            return lastNameInput.trim() !== '';
          }
        },
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: [...new Set(result.map(row => row.title))]
        },
        {
          type: 'input',
          name: 'manager',
          message: "Who is the employee's manager?",
          validate: managerInput => {
            return managerInput.trim() !== '';
          }
        }
      ])
      .then(({ firstName, lastName, role, manager }) => {
        const roleId = result.find(row => row.title === role).id;
        const managerId = result.find(row => row.last_name === manager).id;
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId], (err, result) => {
          if (err) throw err;
          console.log(`Added ${firstName} ${lastName} to the database.`);
          employeeTracker();
        });
      });
  });
};

const updateEmployeeRole = () => {
  db.query('SELECT * FROM employee, role', (err, result) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee',
          message: "Which employee's role do you want to update?",
          choices: [...new Set(result.map(row => row.last_name))]
        },
        {
          type: 'list',
          name: 'role',
          message: 'What is the new role?',
          choices: [...new Set(result.map(row => row.title))]
        }
      ])
      .then(({ employee, role }) => {
        const employeeId = result.find(row => row.last_name === employee).id;
        const roleId = result.find(row => row.title === role).id;
        db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId], (err, result) => {
          if (err) throw err;
          console.log(`Updated ${employee}'s role in the database.`);
          employeeTracker();
        });
      });
  });
};

const close = () => {
  db.end();
  console.log('Bye!');
};

init();