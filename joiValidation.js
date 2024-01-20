const contactFormSchema = {
  name: Joi.string().required().min(2),
  email: Joi.string().email().min(5).max(100).required(),
  phone: Joi.string().length(11),
  date: Joi.string().length(10),
  feedback: Joi.string().min(20),
};

const userFormInput = {};

const formRef = document.getElementById("myForm");
formRef.addEventListener("input", (e) => {
  userFormInput[e.target.name] = e.target.value;

  Joi.validate(
    userFormInput,
    contactFormSchema,
    { abortEarly: false },
    (errors, results) => {
      const errorsConvert = {};

      if (errors) {
        errors.details.forEach((error) => {
          errorsConvert[error.context.key] = error.message;
        });
      }

      const errorRefs = document.getElementsByTagName("p");
      Array.from(errorRefs).forEach((error) => {
        error.innerHTML = "";
      });
      console.log(errors.details);

      for (const error in errorsConvert) {
        document.getElementById(`${error}Error`).innerHTML =
          errorsConvert[error].charAt(1).toUpperCase() +
          errorsConvert[error].slice(2).replace(/"/g, "");
      }
    }
  );
});
