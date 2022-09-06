// NB: These are "test" keys and not secret.

use stripe::{Customer, Expandable};

// This non-secret is for the web frontend
pub const STRIPE_PUBLISHABLE_KEY : &'static str = "pk_test_51KZvWXEU5se17Mekx6e0gw32ovDF78k2eeaGctLIs8oQVxN6DerEp1BDqh6gLMYKli4VsTZoVGHoxq5RmwKMlxtP00r59UEEad";

// This secret is for the backend
pub const STRIPE_SECRET_KEY : &'static str = "sk_test_51KZvWXEU5se17Mek11ZdnWr4frnyw7tWOPuvl3pRzL290zvkT6KqcbGUl3fcvc3hA8oH6lWXz2kGWXXUlNcCuDxB003uVT9JX0";

// This secret is for webhooks
pub const STRIPE_WEBHOOK_SIGNING_SECRET_KEY : &'static str = "whsec_40b60bd75768052532b63dbeefa7a1b163e182c3e657fb27fa906ef49a2cd59f";

// NB: These are "test" product IDs.
pub const PRODUCT_FAKEYOU_BASIC_ID : &'static str = "prod_MMxi2J5y69VPbO";
pub const PRODUCT_FAKEYOU_BASIC_PRICE_ID : &'static str = "price_1LeDnKEU5se17MekVr1iYYNf";


pub fn get_customer_id(expandable_customer: &Expandable<Customer>) -> String {
  match expandable_customer {
    Expandable::Id(id) => id.to_string(),
    Expandable::Object(customer) => customer.id.to_string(),
  }
}