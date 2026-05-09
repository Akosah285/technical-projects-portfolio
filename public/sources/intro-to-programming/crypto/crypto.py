# crypto.py
# Functions for CS 1 Lab Assignment 4.
from random import*
BYTE_SIZE = 8                   # bits per byte


# Return (x**d) % n.
def modular_exponentiation(x, d, n):
    if d == 0:
        return 1
    elif d % 2 == 0:
        y = modular_exponentiation(x, d // 2, n)
        return (y * y) % n
    else:
        return (modular_exponentiation(x, d-1, n) * x) % n


# Takes a bytes or bytearray object and converts it to an int.
# Character 0 of the bytes/bytearray should be in byte 0 (the rightmost
# byte) of the int when we are done.
def bytes_to_int(bytes):
    result = 0
    shift = 0

    for byte in bytes:
        result += byte << shift
        shift += BYTE_SIZE

    return result


# Takes an int x and converts it to a bytearray.  Byte 0 (the least significant
# byte of the int) becomes byte 0 of the bytearray.  Also takes as a parameter
# the number of bytes to include in the bytearray.
def int_to_bytes(x, size):
    result = bytearray()
    mask = 0xFF     # mask for isolating least significant byte

    for i in range(size):
        result.append(x & mask)
        x >>= BYTE_SIZE

    return result


# Generate a random pad for a given number of bytes.  Return the pad,
# represented as a bytearray.
def generate_pad(block_size):
    random_pad = bytearray()    # create an empty bytearray
    for i in range(block_size):  # iterate by length of block size
        random_int = randint(0, 255)  # generate random integers from 0 to 255
        random_pad.append(random_int)  # append random integer to bytearray object
    return random_pad      # returns random bytearray


# XOR a block of bytes, byte by byte, with a key, which is a bytearray.
# The key must be at least as long as the block.
# Return the XORed block of bytes as a bytearray.
def xor_block(key, block):
    assert len(key) >= len(block)
    xored_byte = bytearray()  # creates an empty bytearray
    for i in range(len(block)):  # index through
        xor_byte = block[i] ^ key[i]  # XOR ith byte of block with ith byte of key
        xored_byte.append(xor_byte)  # append XORed byte to xored_byte bytearray
    return xored_byte  # Return the XORed block of bytes as a bytearray


# Encrypt a plaintext file into a ciphertext file, using the hybrid cryptosystem.
# Parameters are the name of the plaintext file, the name of the ciphertext file,
# the exponent and modulus used for RSA encryption of the one-time pad, the
# number of bytes in the one-time pad, and the one-time pad (if None, then generate
# the one-time pad).
def encrypt_file(plaintext_file_name, ciphertext_file_name, e, n, block_size, pad=None):

    open_plaintext = open(plaintext_file_name, "rb")    # open and read from plaintext file
    write_cipher = open(ciphertext_file_name, "wb")     # opens cipher text file for writing

    if pad == None:
        pad = generate_pad(block_size)    # use randomly generated pad

    num_pad = bytes_to_int(pad)           # convert pad to an integer
    encrypt_pad = modular_exponentiation(num_pad, e, n)  # encrypt pad using RSA
    encrypt_pad = (str(encrypt_pad) + "\n").encode()     # convert pad into a byte

    write_cipher.write(encrypt_pad)    # write encrypted pad to cipher text file

    # read plaintext in 16 characters and xor blocks with pad
    block = open_plaintext.read(16)
    while len(block) > 0:
        xored_block = xor_block(pad, block)
        write_cipher.write(xored_block)
        block = open_plaintext.read(16)

    write_cipher.close()    # close file after writing
    open_plaintext.close()  # close file after reading


# Decrypt just a one-time pad from a file.  Assumes that the file is already open and
# that the caller will close the file.  The encrypted one-time pad is text that is
# the first line in the file.  Parameters are the file object, the exponent and modulus
# used for RSA decryption of the one-time pad, and the number of bytes in the one-time
# pad.  Returns the one-time pad as a bytearray.
def decrypt_pad(pad_file, d, n, block_size):
    one_time_pad = pad_file.readline()  # read first line of pad file
    int_of_pad = int(one_time_pad)      # convert read line with integer value
    one_time_pad_mod = modular_exponentiation(int_of_pad, d, n)  # use RSA to decrypt one_time pad
    decrypted_pad = int_to_bytes(one_time_pad_mod, block_size)   # converts decrypted pad into byte

    return decrypted_pad       # returns decrypted pad


# Decrypt a ciphertext file into a decrypted plaintext file, using the hybrid cryptosystem.
# Parameters are the name of the ciphertext file, the name of the decrypted plaintext file,
# the exponent and modulus used for RSA decryption of the one-time pad, the
# number of bytes in the one-time pad, and the one-time pad (if None, then read and
# decrypt the one-time pad from the ciphertext file).
def decrypt_file(ciphertext_file_name, decrypted_file_name, d, n, block_size, pad=None):

    open_cipher = open(ciphertext_file_name, "rb")     # opens cipher text file for reading
    out_decrypt = open(decrypted_file_name, "wb")       # opens decrypted text file for writing

    if pad == None:
        pad = decrypt_pad(open_cipher, d, n, block_size)  # if we have no pad, use decrypted pad

    block = open_cipher.read(16)   # read cipher text 16 characters a time
    # xor block when length of block greater than zero
    while len(block) > 0:
        xored_block = xor_block(pad, block)
        out_decrypt.write(xored_block)
        block = open_cipher.read(16)

    out_decrypt.close()   # close file after writing
    open_cipher.close()   # close file after reading

