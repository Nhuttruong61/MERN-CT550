import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../service/userService";
import { getUser} from "../redux/action/userAction";
import Loading from "../components/Loading";
import { toast } from "react-toastify";

function Address() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [addressType, setAddressType] = useState("");
  const [newAddressType, setNewAddressType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (user?.account?.addresses) {
      for (let i = 0; i < user.account.addresses.length; i++) {
        const item = user.account.addresses[i];
        setCountry(item.country);
        setCity(item.city);
        setAddress(item.address);
        setAddressType(item.addressType);
      }
    }
  }, [user]);

  const handleOnchangeCountry = (e) => setCountry(e.target.value);
  const handleOnchangeCity = (e) => setCity(e.target.value);
  const handleOnchangeAddress = (e) => setAddress(e.target.value);
  const handleOnchangaAddressType = (e) => setAddressType(e.target.value);
  const handleOnchangaNewAddressType = (e) => {
    setNewAddressType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAddressType =
      addressType === "other" ? newAddressType : addressType;
    const addressUser = {
      country: country,
      city: city,
      address: address,
      addressType: finalAddressType,
    };

    try {
      setIsLoading(true);
      const update = await updateAddress(addressUser);
      if (update.success) {
       
        toast.success("Thay đổi địa chỉ thành công");
      }
    } catch (error) {
      toast.error("Đã có lỗi xãy ra vui lòng thử lại sao", error);
      console.log(e);
    } finally {
      dispatch(getUser());
      setIsLoading(false);
    }
  };
  return (
    <Loading isLoading={isLoading}>
      <div className="w-full bg-[#3E3E3F] h-auto p-5 md:p-10 lg:p-20 xl:p-20">
        <div className="px-5 md:px-10 lg:px-20 text-white bg-[#3E3E3F]">
          <h1 className="font-[600] text-[18px] md:text-[24px] lg:text-[24px] xl:text-[24px]">
            Tài khoản cá nhân
          </h1>
          <p className="text-[#ff7700] font-[600] text-lg md:text-xl lg:text-xl xl:text-xl">
            Tài khoản
          </p>
        </div>
        <div className="flex bg-white px-5 md:px-20 py-5 md:py-10">
          <form
            className="w-full text-[80%] md:text-[100%]"
            onSubmit={handleSubmit}
          >
            <label className="flex items-center my-2 justify-between ">
              <p className="md:w-[30%] xl:w-[10%]  font-[600] ">Quốc Gia</p>
              <input
                type="text"
                name="name"
                placeholder="Nhập tên quốc gia"
                value={country}
                className="w-[70%] md:px-4 xl:w-[85%] h-auto py-2 border-[2px] sm:px-0 rounded-[4px]"
                onChange={handleOnchangeCountry}
              />
            </label>
            <label className="flex items-center my-2 justify-between">
              <p className="md:w-[30%] xl:w-[10%] font-[600]">Thành Phố:</p>
              <input
                type="text"
                name="email"
                placeholder="Nhập địa chỉ thành phố"
                value={city}
                onChange={handleOnchangeCity}
                className="w-[70%] md:px-4 xl:w-[85%] h-auto py-2 border-[2px] sm:px-0 rounded-[4px]"
              />
            </label>
            <label className="flex items-center my-2 justify-between">
              <p className="md:w-[30%] xl:w-[10%] font-[600]">Địa chỉ:</p>
              <input
                type="text"
                placeholder="Nhập địa chỉ cụ thế"
                value={address}
                name="phone"
                className="w-[70%] md:px-4 xl:w-[85%] h-auto py-2 border-[2px] sm:px-0 rounded-[4px]"
                onChange={handleOnchangeAddress}
              />
            </label>
            <label className="flex items-center my-2 justify-between">
              <p className="md:w-[30%] xl:w-[10%] font-[600]">Loại địa chỉ:</p>
              <select
                value={addressType}
                onChange={handleOnchangaAddressType}
                className="w-[70%] md:px-4 xl:w-[85%] h-auto py-2 border-[2px] sm:px-0 rounded-[4px]"
              >
                <option value="Nhà">Nhà</option>
                <option value="Doanh nghiệp">Doanh Nghiệp</option>
                <option value="other">Khác</option>
              </select>
            </label>
            {addressType === "other" && (
              <div className="flex items-center my-2 justify-end">
                <input
                  type="text"
                  placeholder="Nhập loại địa chỉ"
                  value={newAddressType}
                  name="newAddressType"
                  className="w-[70%] md:px-4 xl:w-[85%] h-auto py-2 border-[2px] sm:px-0 rounded-[4px] flex-row-reverse"
                  onChange={handleOnchangaNewAddressType}
                />
              </div>
            )}

            <label className="flex flex-row-reverse font-[500] ">
              <button className="bg-black text-white px-4 py-2  rounded-[4px]">
                Thay đổi
              </button>
            </label>
          </form>
        </div>
      </div>
    </Loading>
  );
}

export default Address;
