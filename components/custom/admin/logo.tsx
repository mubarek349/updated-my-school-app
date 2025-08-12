import Image from "next/image";

export const Logo = () =>{
       return (
        <Image
          alt="logo"
          src="/logo.png"
          width={50}
          height={20}
          style={{ width: "auto", height: "auto" }}
        />
       );
}
