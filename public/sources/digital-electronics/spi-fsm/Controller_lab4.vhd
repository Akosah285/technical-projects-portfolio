----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 05/10/2020 11:44:12 AM
-- Design Name: 
-- Module Name: Controller_lab4 - Behavioral
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
use IEEE.NUMERIC_STD.ALL;

-- Uncomment the following library declaration if instantiating
-- any Xilinx leaf cells in this code.
--library UNISIM;
--use UNISIM.VComponents.all;

entity Controller_lab4 is
--  Port ( );
    port( take_sample 	: in std_logic;
    	  sclk	: in std_logic;
    	  load_en : out std_logic;
    	  spi_cs  : out std_logic;
    	  shift_en 	: out std_logic);
end Controller_lab4;

architecture Behavioral of Controller_lab4 is
    type state_type is (SWait, Load, Shift);
    signal current_state, next_state : state_type := SWait;
    signal CE : std_logic;
    signal TC : std_logic;
    signal count : unsigned(5 downto 0) := (others => '0');
    
    
begin
    stateUpdate : process(sclk)
    begin
        if rising_edge(sclk) then
            current_state <= next_state;
        end if;
     end process stateUpdate;   
    
    next_state_logic : process(take_sample,current_state,TC)
    begin
        next_state <= current_state;
        spi_cs <= '1';
        shift_en <= '0';
        load_en <= '0';
        
        case(current_state) is 
            when SWait => 
                shift_en <= '0';
                load_en <= '0';
                spi_cs <= '1';
                if (take_sample = '1') then
                    next_state <= Shift;
                else
                    next_state <= Swait;
                end if;
             when Load =>
                --shift_en <= '0';
                load_en <= '1';
                spi_cs <= '1';
                CE <= '0';
                next_state <= SWait;
            when Shift =>
                shift_en <= '1';
                load_en <= '0';
                spi_cs <= '0';
                CE <= '1';
                if (TC = '1') then
                    next_state <= Load;
                else 
                    next_state <= Shift;
                end if;
            when OTHERS =>
                next_state <= SWait;
            end case;
         end process next_state_logic;

     Count_proc : process(CE,sclk)
     begin
     if rising_edge(sclk) then
     if (CE = '1') then
        if count = 14 then
            TC <= '1';
            count <= (others => '0');
        else 
            TC <= '0';
            count <= count + 1;
        end if;
     end if;
     end if;
     end process Count_proc;
end Behavioral;