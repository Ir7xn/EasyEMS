package com.ems.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "employees")
public class Employee {

    @Id
    private String id;

    private String employeeId;
    private String name;
    private String email;
    private String department;
    private String position;
    private String status;
    private double salary;
    private Date joinDate;
    private String manager;
    private String phone;

    // Constructors
    public Employee() {}

    public Employee(String employeeId, String name, String email, String department,
                    String position, String status, double salary,
                    Date joinDate, String manager, String phone) {
        this.employeeId = employeeId;
        this.name = name;
        this.email = email;
        this.department = department;
        this.position = position;
        this.status = status;
        this.salary = salary;
        this.joinDate = joinDate;
        this.manager = manager;
        this.phone = phone;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
    public Date getJoinDate() { return joinDate; }
    public void setJoinDate(Date joinDate) { this.joinDate = joinDate; }
    public String getManager() { return manager; }
    public void setManager(String manager) { this.manager = manager; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
