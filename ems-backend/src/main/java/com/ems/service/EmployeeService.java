package com.ems.service;

import com.ems.model.Employee;
import com.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    // Get all employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Add a new employee
    public Employee addEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // Get employee by ID
    public Employee getEmployeeById(String id) {
        Optional<Employee> employee = employeeRepository.findById(id);
        return employee.orElse(null);
    }

    // Update employee
    public Employee updateEmployee(String id, Employee updatedEmployee) {
        Optional<Employee> employeeOpt = employeeRepository.findById(id);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setEmployeeId(updatedEmployee.getEmployeeId());
            employee.setName(updatedEmployee.getName());
            employee.setEmail(updatedEmployee.getEmail());
            employee.setDepartment(updatedEmployee.getDepartment());
            employee.setPosition(updatedEmployee.getPosition());
            employee.setStatus(updatedEmployee.getStatus());
            employee.setSalary(updatedEmployee.getSalary());
            employee.setJoinDate(updatedEmployee.getJoinDate());
            employee.setManager(updatedEmployee.getManager());
            employee.setPhone(updatedEmployee.getPhone());
            return employeeRepository.save(employee);
        }
        return null;
    }

    // Delete employee
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }
}
