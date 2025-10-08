package com.ems.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

import lombok.Data;

@Data
@Document(collection = "payrolls")
public class Payroll {
    @Id
    private String id;
    private String payrollId;
    private String employeeId;
    private String employeeName;
    private String department;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private double baseSalary;
    private double overtime;
    private double bonus;
    private double taxWithholding;
    private double healthInsurance;
    private double retirement401k;
    private double grossPay;
    private double totalDeductions;
    private double netPay;
    private String status;
    private LocalDate payDate;
}

