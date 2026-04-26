# Architecture Notes

## Apps

- User app: mobile first
- Admin app: web only
- Backend: shared for both apps

## Core modules

- users
- medicines
- inventory
- prescriptions
- orders
- medicine conflicts

## Conflict rule

Block checkout when:

- two medicines in the current cart conflict
- a cart medicine conflicts with a medicine bought in the last 7 days
