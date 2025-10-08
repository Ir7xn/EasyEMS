    package com.ems.controller;

    import com.ems.model.Payroll;
    import com.ems.repository.PayrollRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/payroll")
    @CrossOrigin(origins = "http://localhost:3000") // allow React frontend
    public class PayrollController {

        @Autowired
        private PayrollRepository payrollRepo;
            public PayrollController() {
        System.out.println("✅ PayrollController loaded!");
    }

        // ✅ Get all payroll records
        @GetMapping
        public ResponseEntity<List<Payroll>> getAllPayrolls() {
            return ResponseEntity.ok(payrollRepo.findAll());
        }

        // ✅ Get payroll by ID
        @GetMapping("/{id}")
        public ResponseEntity<Payroll> getPayrollById(@PathVariable String id) {
            return payrollRepo.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        // ✅ Create new payroll (auto-calculates salary)
        @PostMapping
        public ResponseEntity<Payroll> createPayroll(@RequestBody Payroll payroll) {
            calculatePayroll(payroll);
            Payroll saved = payrollRepo.save(payroll);
            return ResponseEntity.ok(saved);
        }

        // ✅ Update payroll by ID (auto-calculates salary)
        @PutMapping("/{id}")
        public ResponseEntity<Payroll> updatePayroll(@PathVariable String id, @RequestBody Payroll payroll) {
            if (!payrollRepo.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            payroll.setId(id);
            calculatePayroll(payroll);
            Payroll updated = payrollRepo.save(payroll);
            return ResponseEntity.ok(updated);
        }

        // ✅ Delete payroll by ID
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deletePayroll(@PathVariable String id) {
            if (!payrollRepo.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            payrollRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }

        // 🔹 Helper method to auto-calculate payroll
        private void calculatePayroll(Payroll payroll) {
            double gross = payroll.getBaseSalary() + payroll.getOvertime() + payroll.getBonus();
            double deductions = payroll.getTaxWithholding()
                                    + payroll.getHealthInsurance()
                                    + payroll.getRetirement401k();
            payroll.setGrossPay(gross);
            payroll.setTotalDeductions(deductions);
            payroll.setNetPay(gross - deductions);
        }
    }
