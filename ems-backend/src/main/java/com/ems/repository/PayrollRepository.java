package com.ems.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ems.model.Payroll;

public interface PayrollRepository extends MongoRepository<Payroll, String> {
}
