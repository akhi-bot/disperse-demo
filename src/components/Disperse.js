import React, { useState } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { createTheme } from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";
import { CgDanger } from "react-icons/cg";

const arraySum = (array) => {
  return array.reduce((accumulator, current) => accumulator + current, 0);
};

const Disperse = () => {
  const [text, setText] = useState(
    "0x2CB99F193549681e06C6770dDD5543812B4FaFE8 15\n0x2CB99F193549681e06C6770dDD5543812B4FaFE8 20\n0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB 10\n0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB 5\n0xEb0D38c92deB969b689acA94D962A07515CC5204 12"
  );
  const [duplicateAddress, setDuplicateAddress] = useState([]);
  const [error, setError] = useState([]);
  const [errorType, setErrorType] = useState("");

  const handleChange = (value) => {
    setText(value);
  };

  const onSubmit = (event) => {
    setError([]);
    setErrorType("");
    setDuplicateAddress([]);
    event.preventDefault();
    let linesArray = text.split("\n");

    const linesDetails = linesArray.map((item, index) => {
      let detailsArray = item.split(/[=, ]+/);

      return {
        address: detailsArray[0],
        amount: Number(detailsArray[1]),
        line: index + 1,
      };
    });

    // check type of amount is number
    const amountError = linesDetails.reduce((result, current) => {
      if (isNaN(current.amount)) {
        result.push({ line: current.line, value: "wrong amount" });
      }
      return result;
    }, []);
    if (amountError.length) {
      setError(amountError);
      setErrorType("amount");
      return;
    }

    // check duplicate address error
    const addressObject = linesDetails.reduce((result, current) => {
      if (result[current.address]) {
        result[current.address] = {
          ...result[current.address],
          lines: [...result[current.address].lines, current.line],
          amounts: [...result[current.address].amounts, current.amount],
        };
      } else {
        result[current.address] = {
          address: current.address,
          lines: [current.line],
          amounts: [current.amount],
        };
      }

      return result;
    }, {});

    const filteredAddresses = Object.values(addressObject);
    setDuplicateAddress(filteredAddresses);
    const duplicateError = filteredAddresses.reduce((result, current) => {
      if (current.amounts.length > 1) {
        result.push({ address: current.address, lines: current.lines });
      }
      return result;
    }, []);
    if (duplicateError.length) {
      setError(duplicateError);
      setErrorType("duplicate");
      return;
    }

    alert("Your Form validation is completed");
  };

  // keep firstOne
  const keepFirstOne = () => {
    const firstAddress = duplicateAddress.reduce((result, current) => {
      result.push(`${current.address} ${current.amounts[0]}`);

      return result;
    }, []);

    const editorValue = firstAddress.join("\n");
    setText(editorValue);
    setError([]);
    setErrorType("");
    setDuplicateAddress([]);
  };

  // Combine Balance
  const combineBalances = () => {
    const combineBalanceAddress = duplicateAddress.reduce((result, current) => {
      result.push(`${current.address} ${arraySum(current.amounts)}`);

      return result;
    }, []);

    const editorValue = combineBalanceAddress.join("\n");
    setText(editorValue);

    setError([]);
    setErrorType("");
    setDuplicateAddress([]);
  };

  const myTheme = createTheme({
    dark: "light",
    settings: {
      background: "#f5f6fa",
      foreground: "#000",
      selection: "#8a91991a",
      selectionMatch: "red",
      lineHighlight: "transparent",
      gutterBackground: "#f5f6fa",
      gutterForeground: "#999999",
      gutterBorder: "f5f6fa",
      border: "none",
      outline: "none",
    },
  });
  return (
    <Card className=" main-card mx-auto px-4 pt-3 pb-4 my-5">
      <Card.Body>
        <Form onSubmit={onSubmit}>
          <Row className="flex-column align-items-center gap-3">
            <Col sm={12} md={6} xl={6} className=" multiline-input">
              <Form.Label className="label-text">
                Address with amount
              </Form.Label>
              <CodeMirror
                value={text}
                style={{ outline: "none", borderRadius: "5px" }}
                height="15rem"
                theme={myTheme}
                onChange={handleChange}
                className="custom-codemirror"
              />

              <div className="label-text mt-2">
                Separated by "," or "" or "="
              </div>
            </Col>
            <Col sm={12} md={6} xl={6} className="text-danger border-danger">
              {/* error top */}
              {errorType === "duplicate" && (
                <div className="d-flex justify-content-between align-items-center">
                  <div>Duplicate</div>
                  <div>
                    <span className="cursor-pointer" onClick={keepFirstOne}>
                      Keep the first one
                    </span>
                    <span className="mx-2"> |</span>
                    <span className="cursor-pointer" onClick={combineBalances}>
                      Combine Balance
                    </span>
                  </div>
                </div>
              )}
              {/* error bottom */}

              {errorType && (
                <div className="d-flex justify-content-start align-items-start gap-4 border border-danger mt-2 rounded px-1 py-2">
                  <CgDanger size={24} />
                  <div className="d-flex flex-column">
                    {error?.map((errorItem) => (
                      <div>
                        {errorType === "amount"
                          ? `Line ${errorItem.line} ${errorItem.value}`
                          : errorType === "duplicate"
                          ? `Address ${
                              errorItem.address
                            } in Line: ${errorItem.lines.join(", ")}`
                          : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Col>
            <Col sm={12} md={6} xl={6} className="pt-3  mt-3 position-relative">
              <Button type="submit" size="lg" className="w-100 submit-button">
                Next
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Disperse;
