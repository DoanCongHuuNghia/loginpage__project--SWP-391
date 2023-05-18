// đối tượng "validator"
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // hàm thực hiện validate
    function validate (inputElement, rule) {
        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.erorrSelector);
        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // lặp qua từng rule & kiểm tra
        // nêu có lỗi dừng kiểm tra(kiểm tra lần lượt từng rule)
        for (var i = 0; i < rules.length; i++) {

            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // hàm xử lý khi người dùng nhập vào input
    function removevalidate(inputElement) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.erorrSelector);
        errorElement.innerText = '';
        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }

    // lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement){
        // khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // submit với js
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        
                        switch(input.type) {
                            case'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked');
                                break;
                            case'checkbox':
                                if(!input.matches(':checked')) return values;

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                } 

                                values[input.name].push(input.value);
                                break;
                            case'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    }, {});

                    options.onSubmit(formValues);
                // submit mặc định 
                } else {
                    formElement.submit();
                }
            }
        }

        // lặp qua các rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule) {

            // lưu lại cái rules cho mỗi input

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }          

            var inputElements = formElement.querySelectorAll(rule.selector);  
            
            Array.from(inputElements).forEach(function (inputElement) {
                // xử lý khi blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                    
                }
                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    // khi confirmpassword có erorrMsg và người dùng nhập tại password nếu giống với confirmpassword thì xóa erorrMsg của confirmpassword
                    if (document.querySelector(options.password).value === document.querySelector(options.confirmPassword).value
                    && inputElement === document.querySelector(options.password)) {
                        removevalidate(getParent(inputElement, options.form).querySelector(options.confirmPassword));
                    // khi password có erorrMsg và người dùng nhập tại confirmpassword nếu giống với password thì xóa erorrMsg của password
                    } else if (document.querySelector(options.password).value === document.querySelector(options.confirmPassword).value
                    && inputElement === document.querySelector(options.confirmPassword)) {
                        removevalidate(getParent(inputElement, options.form).querySelector(options.password));
                    }
                    removevalidate(inputElement);
                }
                // thêm onchange để khi select sai sẽ báo lỗi
            });
        });
    }
}

// định nghĩa rules
// nguyên tắc của các rules
// 1.khi có lỗi => trả ra messages lỗi
// 2.khi hợp lệ => không trả gì cả
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || "Please don't leave this empty";
        }
    }
}

Validator.isRequiredCheck = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || "Please don't leave this empty";
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Ex: email@.domain.com";
        }
    }
}

Validator.isPhoneNumber = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            return regex.test(value) ? undefined : message || "Ex: 0123456789";
        }
    }
}

Validator.isPassword = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Please enter at least ${min} characters`;
        }
    }
}

// Validator.isConfirmed = function (selector, getConfirmValue, message) {
//     return {
//         selector: selector,
//         test: function (value) {
//             return value === getConfirmValue() ? undefined : message || "The value entered is incorrect";
//         }
//     }
// }

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? "" : message || "The value entered is incorrect";
        }
    }
}

Validator.isConfirmedPassword = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() || getConfirmValue() === '' ? "" : message || "The value entered is incorrect";
        }
    }
}