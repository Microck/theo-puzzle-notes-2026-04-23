package main

import (
	"crypto/aes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

var (
	raw = []byte{
		0xfe, 0xb4, 0x68, 0x49, 0xaa, 0x6c, 0x1b, 0x49, 0x98, 0x26, 0xd7, 0xcc, 0xc4, 0xa0, 0x37, 0x2e,
		0x28, 0x1c, 0x70, 0x53, 0xb2, 0x94, 0xbf, 0x99, 0x2f, 0xbb, 0x2d, 0x2b, 0xcc, 0x75, 0x76, 0x4f,
		0xb8, 0xdd, 0x9d, 0xac, 0x8d, 0x78, 0x48, 0x34, 0xbf, 0xaa, 0xd4, 0x1b, 0x56, 0x05, 0x20, 0x90,
		0x05, 0xf9, 0xc0, 0x25, 0x74, 0x70, 0x62, 0x40, 0x4d, 0x18, 0x1c, 0x59, 0xca, 0x29, 0xca, 0x57,
		0xe2, 0x33, 0xde, 0xf4, 0xa9, 0x7d, 0x12, 0xda, 0xea, 0x48,
	}
	appSalt = []byte("github.com/pableeee/steg/v1")
	seeds   = []string{
		"Break the glass",
		"It's Beatle-proof",
		"Nothing is Beatle-proof",
		"Have a look in your pocket",
		"I've got a hole in me pocket",
		"Brick Joke",
		"Mind Screw",
		"The Walrus Was Paul",
		"This Index Will Be Important Later",
		"Number nine",
		"Revolution 9",
		"Revolution Nine",
		"Eleanor Rigby",
		"Ah, look at all the lonely people",
		"Where do they all belong?",
		"I am the Walrus",
		"The walrus was Paul!",
		"Let's see the fuckers figure that one out",
		"I was the walrus, but now, I'm John.",
		"Regent Sound",
		"Regent Sound Studio",
		"Regent Sound in Tottenham Court Road",
		"Tottenham Court Road",
		"Tin Pan Alley",
		"Parkes restaurant",
		"Fixing a hole in the ocean",
		"Trying to make a dove-tail joint, yeah",
		"Looking through the bent backed tulips",
		"To see how the other half live",
		"You know the place where nothing is real.",
	}
)

func variants(s string) []string {
	clean := func(x string) string {
		r := strings.NewReplacer("-", "", ".", "", ",", "", "'", "", "\"", "", "!", "", "?", "")
		return strings.Join(strings.Fields(r.Replace(x)), " ")
	}
	out := []string{
		s,
		strings.ToLower(s),
		clean(s),
		strings.ToLower(clean(s)),
	}
	seen := map[string]bool{}
	var uniq []string
	for _, v := range out {
		if v == "" || seen[v] {
			continue
		}
		seen[v] = true
		uniq = append(uniq, v)
	}
	return uniq
}

func derive(pass []byte) (uint32, []byte) {
	derived := argon2.IDKey(pass, appSalt, 1, 64*1024, 4, 24)
	nonceSeed := binary.BigEndian.Uint64(derived[0:8])
	_ = nonceSeed
	return 0, derived[8:24]
}

func keystream(aesKey []byte, nonce uint32, n int) []byte {
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		panic(err)
	}
	out := make([]byte, n)
	var counter uint32
	for off := 0; off < n; off += 16 {
		counterBytes := make([]byte, 8)
		binary.LittleEndian.PutUint32(counterBytes, counter)
		nonceBytes := make([]byte, 8)
		binary.LittleEndian.PutUint32(nonceBytes, nonce)
		payload := append(nonceBytes, counterBytes...)
		streamBlock := make([]byte, 16)
		block.Encrypt(streamBlock, payload)
		copy(out[off:], streamBlock)
		counter++
	}
	return out[:n]
}

func xor(a, b []byte) []byte {
	out := make([]byte, len(a))
	for i := range a {
		out[i] = a[i] ^ b[i]
	}
	return out
}

func printable(b []byte) bool {
	for _, c := range b {
		if c == 9 || c == 10 || c == 13 {
			continue
		}
		if c < 32 || c > 126 {
			return false
		}
	}
	return true
}

func try(pass string) bool {
	nonce := binary.BigEndian.Uint32(raw[:4])
	_, key := derive([]byte(pass))
	decrypted := xor(raw[4:], keystream(key, nonce, len(raw)-4))
	if len(decrypted) < 4+32 {
		return false
	}
	length := binary.LittleEndian.Uint32(decrypted[:4])
	if length > uint32(len(decrypted)-4-32) {
		return false
	}
	payload := decrypted[4 : 4+length]
	tag := decrypted[4+length : 4+length+32]
	mac := hmac.New(sha256.New, key)
	mac.Write(payload)
	if !hmac.Equal(tag, mac.Sum(nil)) {
		return false
	}
	fmt.Printf("HIT pass=%q len=%d printable=%v payload=%q\n", pass, length, printable(payload), payload)
	return true
}

func main() {
	hits := 0
	for _, seed := range seeds {
		for _, v := range variants(seed) {
			if try(v) {
				hits++
			}
		}
	}
	fmt.Printf("total_hits=%d\n", hits)
}
