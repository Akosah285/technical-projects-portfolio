----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 05/11/2020 09:49:58 PM
-- Design Name: 
-- Module Name: lab4_datapath_tb - Behavioral
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

entity lab4_datapath_tb is
end lab4_datapath_tb;


architecture Behavioral of lab4_datapath_tb is

component lab4_datapath is
PORT (	sclk  : in std_logic;
      shift_en : in std_logic;
      load_en : in std_logic;
      spi_sdata : in std_logic;
      ad_data : out std_logic_vector(11 downto 0));
end component;

signal sclk 	     : std_logic := '0';
signal shift_en 	 : std_logic := '0'; 
signal load_en	     : std_logic :='0';
signal spi_sdata      : std_logic := '0';
signal ad_data       : std_logic_vector(11 downto 0) := "000000000000";

begin
uut : lab4_datapath PORT MAP(
	sclk => sclk,
    shift_en => shift_en,
    load_en => load_en,
    spi_sdata => spi_sdata,
    ad_data => ad_data);
    
    
    
clk_proc : process
BEGIN
	sclk <= '0';
	wait for 10 ns;
	sclk <= '1';
	wait for 10 ns;
end process clk_proc;

stim_proc: process
begin
	spi_sdata <= '0';
	shift_en <= '1';
    wait for 30 ns;
    
    spi_sdata <= '1';
    wait for 30 ns;
    spi_sdata <= '1';
    wait for 30 ns;
    spi_sdata <= '1';
    wait for 30 ns;
    spi_sdata <= '0';
    wait for 30 ns;
    spi_sdata <= '1';
    wait for 30 ns;
    spi_sdata <= '1';
    wait for 30 ns;
    shift_en <= '0';
    wait for 30 ns;
    
    load_en <= '1';
    wait for 30 ns;
    
    load_en <= '0';
    shift_en <= '1';
    spi_sdata <= '1';
    wait for 30 ns;
    wait;
end process stim_proc;


end Behavioral;
