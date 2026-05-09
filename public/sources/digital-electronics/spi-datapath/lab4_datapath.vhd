----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 05/11/2020 09:20:57 PM
-- Design Name: 
-- Module Name: lab4_datapath - Behavioral
-- Project Name: 
-- Target Devices: 
-- Tool Versions: 
-- Description: 
-- 
-- Dependencies: 
-- 
-- Revision:
-- Revision 0.01 - File Created
-- Additional Comments:
-- 
----------------------------------------------------------------------------------


library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

-- Uncomment the following library declaration if using
-- arithmetic functions with Signed or Unsigned values
--use IEEE.NUMERIC_STD.ALL;

-- Uncomment the following library declaration if instantiating
-- any Xilinx leaf cells in this code.
--library UNISIM;
--use UNISIM.VComponents.all;

entity lab4_datapath is
Port (sclk  : in std_logic;
      shift_en : in std_logic;
      load_en : in std_logic;
      spi_sdata : in std_logic;
      ad_data : out std_logic_vector(11 downto 0));
end lab4_datapath;

architecture Behavioral of lab4_datapath is
signal shift_Register : std_logic_vector(15 downto 0) := (others => '0');
signal output_register: std_logic_vector(11 downto 0) := "000000000000";

begin
ad_data <= output_register;
    process(sclk)
        begin 
            if rising_edge(sclk) then
                if (shift_en = '1') then
                    shift_register <= shift_register(14 downto 0)&spi_sdata;
                 end if;
                 if (load_en = '1') then
                    output_register <= shift_register(11 downto 0);
                 end if;
             end if;
      end process;
end Behavioral;
