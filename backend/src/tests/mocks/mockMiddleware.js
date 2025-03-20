const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    _id: '6531abcd1234',
    name: 'Test User',
    email: 'john@example.com',
    walletAddress: '0x1234567890abcdef'
  };
  next();
};

describe('Mock Middleware', () => {
  it('should add user to request object', () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    mockAuthMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user._id).toBe('6531abcd1234');
    expect(next).toHaveBeenCalled();
  });
});

module.exports = {
  mockAuthMiddleware
};
