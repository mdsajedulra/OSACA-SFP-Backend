"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBanglaNumber = toBanglaNumber;
function toBanglaNumber(n) {
    return n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
}
