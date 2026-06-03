package com.url_shortener.backend.util;

public class Base62Converter {
    private static final String ALLOWED_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = ALLOWED_CHARACTERS.length();

    public static String encode(long input){
        StringBuilder encodedString = new StringBuilder();

        if(input == 0){
            return String.valueOf(ALLOWED_CHARACTERS.charAt(0));
        }

        while(input > 0){
            int remainder = (int) (input % BASE);
            encodedString.append(ALLOWED_CHARACTERS.charAt(remainder));
            input /= BASE;
        }

        return encodedString.reverse().toString();
    }

    public static long decode(String input){
        long decodeId = 0;

        for(int i = 0; i<input.length(); i++){
            char ch = input.charAt(i);
            int charValue = ALLOWED_CHARACTERS.indexOf(ch);

            if(charValue == -1){
                throw new IllegalArgumentException("Invalid character in short key: " + ch);
            }

            decodeId = (decodeId * BASE) + charValue;
        }

        return decodeId;
    }
}
