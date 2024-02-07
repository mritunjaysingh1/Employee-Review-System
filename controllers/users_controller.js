const Review = require("../models/review");
const User = require("../models/user");

// Sign in page
module.exports.signIn = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.redirect("/admin-dashboard");
    }

    return res.redirect(`employee-dashboard/${req.user.id}`);
  }
  return res.render("user_sign_in", {
    title: "Review system | Sign In",
  });
};

// Sign up page
module.exports.signUp = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.redirect("/admin-dashboard");
    }
    return res.redirect(`employee-dashboard/${req.user.id}`);
  }
  return res.render("user_sign_up", {
    title: "Review system | Sign Up",
  });
};

// Add employee page
module.exports.addEmployee = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.render("add_employee", {
        title: "Add Employee ",
      });
    }
  }
  return res.redirect("/");
};

// Edit employee page
module.exports.editEmployee = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") {
        const employee = await User.findById(req.params.id).populate({
          path: "reviewsFromOthers",
          populate: {
            path: "reviewer",
            model: "User",
          },
        });

        const reviewsFromOthers = employee.reviewsFromOthers;

        return res.render("edit_employee", {
          title: "Edit Employee",
          employee,
          reviewsFromOthers,
        });
      }
    }
    return res.redirect("/");
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// Sign up data
module.exports.create = async (req, res) => {
  try {
    const { username, email, password, confirm_password, role } = req.body;

    if (password != confirm_password) {
      req.flash("error", "Password and Confirm password are not same");
      return res.redirect("back");
    }

    User.findOne({ email }, async (err, user) => {
      if (err) {
        console.log("Error in finding user in signing up");
        return;
      }

      if (!user) {
        await User.create(
          {
            email,
            password,
            username,
            role,
          },
          (err, user) => {
            if (err) {
              req.flash("error", "Couldn't sign Up");
            }
            req.flash("success", "Account created!");
            return res.redirect("/");
          }
        );
      } else {
        req.flash("error", "User already registed!");
        return res.redirect("back");
      }
    });
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// Add an employee
module.exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, confirm_password } = req.body;

    if (password != confirm_password) {
      req.flash("error", "Password and Confirm password are not same");
      return res.redirect("back");
    }

    User.findOne({ email }, async (err, user) => {
      if (err) {
        console.log("Error in finding user in signing up");
        return;
      }

      if (!user) {
        await User.create(
          {
            email,
            password,
            username,
          },
          (err, user) => {
            if (err) {
              req.flash("error", "Couldn't add employee");
            }
            req.flash("success", "Employee added!");
            return res.redirect("back");
          }
        );
      } else {
        req.flash("error", "Employee already registered!");
        return res.redirect("back");
      }
    });
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// Update employee details
module.exports.updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    const { username, role } = req.body;

    if (!employee) {
      req.flash("error", "employee does not exist!");
      return res.redirect("back");
    }

    employee.username = username;
    employee.role = role;
    employee.save();

    req.flash("success", "Employee details updated!");
    return res.redirect("back");
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// Delete an user
module.exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    await Review.deleteMany({ recipient: id });

    await Review.deleteMany({ reviewer: id });

    await User.findByIdAndDelete(id);

    req.flash("success", `User and associated reviews deleted!`);
    return res.redirect("back");
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// Sign in and create a session for the user
module.exports.createSession = (req, res) => {
  req.flash("success", "Logged in successfully");
  if (req.user.role === "admin") {
    return res.redirect("/admin-dashboard");
  }

  return res.redirect(`/employee-dashboard/${req.user.id}`);
};

// Clear the cookie
module.exports.destroySession = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    return res.redirect("/");
  });
};
